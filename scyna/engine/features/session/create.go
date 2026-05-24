package session

import (
	"bytes"
	"io"
	"log"
	"net/http"

	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
	scyna_proto "github.com/scyna/core/proto"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
)

var defaultConfig *scyna_proto.Configuration = &scyna_proto.Configuration{
	NatsUrl:      "127.0.0.1",
	NatsUsername: "",
	NatsPassword: "",
	DBHost:       "127.0.0.1",
	DBUsername:   "",
	DBPassword:   "",
	DBLocation:   "",
}

func CreateSessionHandler(w http.ResponseWriter, r *http.Request) {
	buf, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	var request scyna_proto.CreateSessionRequest
	if err := proto.Unmarshal(buf, &request); err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	log.Println("Create session for module: " + request.Module)
	log.Println("Secret: " + request.Secret)

	if sid, err := newSession(request.Module, request.Secret); err == scyna.OK {
		var response scyna_proto.CreateSessionResponse
		response.SessionID = sid

		var value string
		if err := scyna.DB.QueryOne("SELECT value FROM "+scyna_const.SETTING_TABLE+
			" WHERE module = ? AND key = ?", request.Module, scyna_const.SETTING_KEY).Scan(&value); err != nil {
			log.Println("No configuration for module: " + request.Module + ", use default configuration")
		}

		if len(value) > 0 {
			var config scyna_proto.Configuration
			err := protojson.Unmarshal([]byte(value), &config)
			if err != nil {
				response.Config = defaultConfig
			} else {
				response.Config = &config
			}
		} else {
			response.Config = defaultConfig
		}

		if data, err := proto.Marshal(&response); err != nil {
			log.Println("Response error " + err.Error())
			http.Error(w, "Server Error", 400)
		} else {
			w.WriteHeader(200)
			_, err = bytes.NewBuffer(data).WriteTo(w)
			if err != nil {
				log.Println("Proxy write data error: " + err.Error())
			}
		}
		return
	}

	log.Println("Unauthorized access to module: " + request.Module)
	http.Error(w, "Unauthorized", http.StatusUnauthorized)
}
