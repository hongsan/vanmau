package proxy

import (
	"bytes"
	"fmt"
	"net/http"
	"time"

	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
	scyna_proto "github.com/scyna/core/proto"
	scyna_utils "github.com/scyna/core/utils"
	"google.golang.org/protobuf/proto"
)

type trace struct {
	ParentID  uint64
	ID        uint64
	Type      scyna.TraceType
	Time      time.Time
	Duration  uint64
	Path      string
	SessionID uint64
	Status    uint32
	Source    string
	OriginIP  string
}

type Proxy struct {
	Clients  map[string]Client
	Contexts RequestContextPool
}

func NewProxy() *Proxy {
	ret := &Proxy{Contexts: NewContextPool()}
	ret.initClients()
	return ret
}

func (proxy *Proxy) ServeHTTP(rw http.ResponseWriter, req *http.Request) {

	callID := scyna.ID.Next()
	ctx := proxy.Contexts.GetContext()
	defer proxy.Contexts.PutContext(ctx)
	ctx.Build(req)
	if ctx.Url == "/healthz" {
		rw.WriteHeader(http.StatusOK)
		rw.Write([]byte("OK"))
		return
	}

	if ctx.Url == "/" {
		http.Error(rw, "Unauthorized", http.StatusUnauthorized)
		return
	}

	client, ok := proxy.Clients[ctx.ClientID]

	/*CORS*/
	rw.Header().Set("Content-Type", ctx.ContentType)
	rw.Header().Set("Access-Control-Allow-Origin", "*")
	rw.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	originIP := req.Header.Get("CF-Connecting-IP")

	trace := trace{
		ID:        callID,
		ParentID:  0,
		Time:      time.Now(),
		Path:      ctx.Url,
		Type:      scyna.TRACE_ENDPOINT,
		SessionID: scyna.Session.ID(),
		Source:    ctx.ClientID,
		OriginIP:  originIP,
	}
	defer saveTrace(&trace)

	if !ok || ctx.ClientSecret != client.Secret {
		http.Error(rw, "Unauthorized", http.StatusUnauthorized)
		scyna.Session.Info("Wrong client id or secret: " + ctx.ClientID + ", secret: " + ctx.ClientSecret)
		trace.Status = http.StatusUnauthorized
		return
	}

	if err := scyna.DB.AssureExists("SELECT url FROM "+scyna_const.CLIENT_USE_ENDPOINT_TABLE+
		" WHERE client=? AND url=?", ctx.ClientID, ctx.Url); err != nil {
		http.Error(rw, "Unauthorized", http.StatusUnauthorized)
		scyna.Session.Info(fmt.Sprintf("Wrong url: %s, error = %s\n", ctx.Url, err.Message()))
		trace.Status = http.StatusUnauthorized
		return
	}

	request := scyna_proto.Request{Body: ctx.Body}
	var response scyna_proto.Response

	if ctx.ContentType == "application/json" {
		request.JSON = true
	} else if ctx.ContentType == "application/protobuf" {
		request.JSON = false
	} else {
		http.Error(rw, "Content-Type must be JSON or PROTOBUF ", http.StatusNotAcceptable)
		trace.Status = http.StatusNotAcceptable
		return
	}

	request.TraceID = callID

	/*serialize the request */
	reqBytes, err := proto.Marshal(&request)
	if err != nil {
		http.Error(rw, "Cannot process request", http.StatusInternalServerError)
		trace.Status = http.StatusInternalServerError
		return
	}

	/*post request to message queue*/
	msg, respErr := scyna.Nats.Request(scyna_utils.PublishURL(ctx.Url), reqBytes, 60*time.Second)
	if respErr != nil {
		http.Error(rw, "No response", http.StatusInternalServerError)
		trace.Status = http.StatusInternalServerError
		scyna.Session.Error("ServeHTTP: Nats: " + respErr.Error() + " - " + ctx.Url)
		return
	}

	/*response*/
	if err := proto.Unmarshal(msg.Data, &response); err != nil {
		http.Error(rw, "Cannot deserialize response", http.StatusInternalServerError)
		scyna.Session.Error("nats-proxy:" + err.Error())
		trace.Status = http.StatusInternalServerError
		return
	}

	rw.WriteHeader(int(response.Code))
	_, err = bytes.NewBuffer(response.Body).WriteTo(rw)
	if err != nil {
		scyna.Session.Error("Proxy write data error: " + err.Error())
		trace.Status = 0
	}

	trace.Status = uint32(response.Code)

	if f, ok := rw.(http.Flusher); ok {
		f.Flush()
	}
}
