package module

import (
	"encoding/json"
	"time"

	validation "github.com/go-ozzo/ozzo-validation"
	"github.com/nats-io/nats.go"
	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
	scyna_proto "github.com/scyna/core/proto"
	module_define "github.com/scyna/engine/features/module/define"
)

func init() {
	scyna.RegisterEndpoint(scyna_const.MODULE_CREATE, Create)
}

func Create(ctx *scyna.Endpoint, request *scyna_proto.CreateModuleRequest) scyna.Error {

	if err := validation.ValidateStruct(request,
		validation.Field(&request.Code, validation.Required),
		validation.Field(&request.Secret, validation.Required),
		validation.Field(&request.Name, validation.Required),
	); err != nil {
		ctx.Error(err.Error())
		return scyna.REQUEST_INVALID
	}

	var module module_define.Module
	if err := scyna.DB.QueryOne("SELECT code FROM "+scyna_const.MODULE_TABLE+" WHERE module = ?;",
		request.Code).Scan(&module); err == nil {
		return scyna.NewError("ModuleExsited", "Module Existed")
	}

	module = module_define.Module{
		Code:   request.Code,
		Name:   request.Name,
		Secret: request.Secret,
	}

	config := module_define.Config{
		NatsURL:      request.Config.NatsUrl,
		NatsUsername: request.Config.NatsUsername,
		NatsPassword: request.Config.NatsPassword,
		DBHost:       request.Config.DBHost,
		DBUsername:   request.Config.DBUsername,
		DBPassword:   request.Config.DBPassword,
		DBLocation:   request.Config.DBLocation,
	}

	val, err := json.Marshal(config)
	if err != nil {
		ctx.Error(err.Error())
		return scyna.REQUEST_INVALID
	}

	batch := scyna.DB.Batch().
		Add("INSERT INTO "+scyna_const.MODULE_TABLE+" (code, secret, name) VALUES (?,?,?);", module.Code, module.Secret, module.Name).
		Add("INSERT INTO "+scyna_const.SETTING_TABLE+" (module, key, value) VALUES (?,?,?);", module.Code, scyna_const.SETTING_KEY, val)

	if err := batch.Execute(); err != nil {
		ctx.Error(err.Error())
		return scyna.REQUEST_INVALID
	}

	if _, err := scyna.JetStream.StreamInfo(module.Code); err == nil {
		ctx.Error("Stream existed")
		return scyna.SERVER_ERROR
	}

	if _, err := scyna.JetStream.AddStream(&nats.StreamConfig{
		Name:     module.Code,
		Subjects: []string{module.Code + ".>"},
		Storage:  nats.FileStorage,
		Replicas: 1,
		MaxAge:   time.Hour * 24 * 7, //keep for a week
	}); err != nil {
		ctx.Error(err.Error())
		return scyna.SERVER_ERROR
	}

	return scyna.OK
}
