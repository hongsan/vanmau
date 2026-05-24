package setting

import (
	validation "github.com/go-ozzo/ozzo-validation"
	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
	scyna_proto "github.com/scyna/core/proto"
	"log"
)

func ListSettingHandler(ctx *scyna.Endpoint, request *scyna_proto.ListSettingRequest) scyna.Error {
	ctx.Info("Received ListSettingRequest from " + request.Module)

	if err := validation.ValidateStruct(request,
		validation.Field(&request.Module, validation.Required),
	); err != nil {
		ctx.Error(err.Error())
		return scyna.REQUEST_INVALID
	}

	var response scyna_proto.ListSettingResponse

	rows := scyna.DB.QueryMany("SELECT key, value FROM "+scyna_const.SETTING_TABLE+" WHERE module = ?", request.Module)
	for rows.Next() {
		var setting scyna_proto.Setting
		rows.Scan(&setting.Key, &setting.Value)
		response.Items = append(response.Items, &setting)
	}

	log.Println("response:", len(response.Items))

	return ctx.OK(&response)
}
