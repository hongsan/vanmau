package setting

import (
	validation "github.com/go-ozzo/ozzo-validation"
	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
	scyna_proto "github.com/scyna/core/proto"
)

func RemoveHandler(ctx *scyna.Endpoint, request *scyna_proto.RemoveSettingRequest) scyna.Error {
	ctx.Info("Received RemoveSettingRequest from " + request.Module)

	if err := validation.ValidateStruct(request,
		validation.Field(&request.Module, validation.Required),
		validation.Field(&request.Key, validation.Required),
	); err != nil {
		ctx.Error(err.Error())
		return scyna.REQUEST_INVALID
	}

	if err := scyna.DB.Execute("DELETE FROM "+scyna_const.SETTING_TABLE+
		" WHERE module = ? AND key = ?", request.Module, request.Key); err != nil {
		return scyna.SERVER_ERROR
	}

	scyna.EmitSignal(scyna_const.SETTING_REMOVE_CHANNEL+request.Module, &scyna_proto.RemoveSettingRequest{
		Module: request.Module,
		Key:    request.Key,
	})

	return scyna.OK
}
