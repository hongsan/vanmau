package setting

import (
	validation "github.com/go-ozzo/ozzo-validation"
	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
	scyna_proto "github.com/scyna/core/proto"
)

func UpdateSettingHandler(ctx *scyna.Endpoint, request *scyna_proto.UpdateSettingRequest) scyna.Error {
	ctx.Info("Received RemoveSettingRequest from " + request.Module)

	if err := validation.ValidateStruct(request,
		validation.Field(&request.Module, validation.Required),
		validation.Field(&request.Key, validation.Required),
		validation.Field(&request.Value, validation.Required),
	); err != nil {
		ctx.Error(err.Error())
		return scyna.REQUEST_INVALID
	}

	if err := scyna.DB.AssureExists("SELECT value FROM "+scyna_const.SETTING_TABLE+" WHERE module = ? AND key = ? LIMIT 1", request.Module, request.Key); err != nil {
		return scyna.NewError("SettingNotFound", "Setting not found")
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
