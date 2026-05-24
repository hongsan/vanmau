package scyna

import (
	"crypto/tls"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/nats-io/nats.go"
	scyna_const "github.com/scyna/core/const"
	scyna_proto "github.com/scyna/core/proto"
)

type SetupHandler func()

var setups []SetupHandler
var testMode bool = false

func RegisterSetup(starter SetupHandler) {
	setups = append(setups, starter)
}

func startAll() {
	for _, starter := range setups {
		starter()
	}
}

const REQUEST_TIMEOUT = 10

var Nats *nats.Conn
var JetStream nats.JetStreamContext
var Session *session
var DB *db
var ID generator
var Settings settings

var httpClient *http.Client
var module string

func Module() string {
	return module
}

func Release() {
	releaseLog()
	Session.release()
	Nats.Close()
	DB.Close()
}

func StartCoreServices() {
	log.Println("Starting scyna", module)
	ctx := Context{ID: 0}
	ctx.PublishAlertToOperator("Module "+module+" restarted",
		"Engine has been restarted successfully.",
		scyna_proto.AlertSeverity_WARNING)

	startEndpoints()
	startSignals()
	startDomainEvent()
	startEventStreams()
}

func Start() {
	StartCoreServices()

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	<-sig

	EmitSignal(scyna_const.SESSION_END_CHANNEL, &scyna_proto.EndSessionSignal{
		ID:     Session.id,
		Module: module,
		Code:   1,
	})
}

func HttpClient() *http.Client {
	if httpClient == nil {
		httpClient = &http.Client{
			Timeout: time.Second * 5,
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{
					InsecureSkipVerify: true,
				},
			},
		}
	}
	return httpClient
}
