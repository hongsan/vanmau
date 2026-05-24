package setting

import (
	validation "github.com/go-ozzo/ozzo-validation"
	"log"

	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
	scyna_proto "github.com/scyna/core/proto"
)

func WriteHandler(ctx *scyna.Endpoint, request *scyna_proto.WriteSettingRequest) scyna.Error {
	log.Println("Receive WriteSettingRequest from " + request.Module)

	if err := validation.ValidateStruct(request,
		validation.Field(&request.Module, validation.Required),
		validation.Field(&request.Key, validation.Required),
		validation.Field(&request.Value, validation.Required),
	); err != nil {
		ctx.Error(err.Error())
		return scyna.REQUEST_INVALID
	}

	if err := scyna.DB.Execute("INSERT INTO "+scyna_const.SETTING_TABLE+
		" (module, key, value) VALUES (?, ?, ?)",
		request.Module, request.Key, request.Value); err != nil {
		ctx.Error("WriteSetting: " + err.Error())
		return scyna.REQUEST_INVALID
	}

	scyna.EmitSignal(scyna_const.SETTING_UPDATE_CHANNEL+request.Module, &scyna_proto.SettingUpdatedSignal{
		Module: request.Module,
		Key:    request.Key,
		Value:  request.Value,
	})

	return scyna.OK
}
