package proxy

import (
	"bytes"
	"errors"
	"io"
	"net/http"
	"sync"
)

type RequestContext struct {
	ClientID     string
	ClientSecret string
	ContentType  string
	Url          string
	Body         []byte
}

type RequestContextPool struct {
	sync.Pool
}

func newRequestContext() *RequestContext {
	return &RequestContext{
		Body: make([]byte, 4096),
	}
}

func (p *RequestContextPool) GetContext() *RequestContext {
	ctx, _ := p.Get().(*RequestContext)
	return ctx
}

func (p *RequestContextPool) PutContext(service *RequestContext) {
	p.Put(service)
}

func NewContextPool() RequestContextPool {
	return RequestContextPool{
		sync.Pool{
			New: func() interface{} { return newRequestContext() },
		}}
}

func (ctx *RequestContext) Build(req *http.Request) error {
	if req == nil {
		return errors.New("natsproxy: Request cannot be nil")
	}

	ctx.ClientID = req.Header.Get("Client-Id")
	ctx.ClientSecret = req.Header.Get("Client-Secret")
	ctx.ContentType = req.Header.Get("Content-Type")
	ctx.Url = req.URL.String()

	buf := bytes.NewBuffer(ctx.Body)
	buf.Reset()
	if req.Body != nil {
		if _, err := io.Copy(buf, req.Body); err != nil {
			return err
		}
		if err := req.Body.Close(); err != nil {
			return err
		}
	}

	ctx.Body = buf.Bytes()
	return nil
}
