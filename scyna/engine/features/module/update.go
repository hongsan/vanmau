package module

import (
	validation "github.com/go-ozzo/ozzo-validation"
	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
	scyna_proto "github.com/scyna/core/proto"
)

func init() {
	scyna.RegisterEndpoint(scyna_const.MODULE_UPDATE, UpdateModuleHandler)
}

func UpdateModuleHandler(ctx *scyna.Endpoint, request *scyna_proto.UpdateModuleRequest) scyna.Error {
	ctx.Info("Receive UpdateModuleRequest with code: " + request.Code)

	if err := validation.ValidateStruct(request,
		validation.Field(&request.Code, validation.Required),
	); err != nil {
		ctx.Error(err.Error())
		return scyna.REQUEST_INVALID
	}

	if err := scyna.DB.AssureExists("SELECT * FROM "+scyna_const.MODULE_TABLE+" WHERE code = ?",
		request.Code); err != nil {
		return err
	}

	if err := scyna.DB.Execute("UPDATE "+scyna_const.MODULE_TABLE+" SET name = ? WHERE code = ?;", request.Name, request.Code); err != nil {
		ctx.Error(err.Error())
		return scyna.SERVER_ERROR
	}

	return scyna.OK
}
