package module

import (
	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
	scyna_proto "github.com/scyna/core/proto"
	module_define "github.com/scyna/engine/features/module/define"
)

func init() {
	scyna.RegisterEndpoint(scyna_const.MODULE_LIST, ListModuleHandler)
}

func ListModuleHandler(ctx *scyna.Endpoint, request *scyna_proto.ListModuleRequest) scyna.Error {
	rows := scyna.DB.QueryMany("SELECT code, name, secret FROM " + scyna_const.MODULE_TABLE)
	var response scyna_proto.ListModuleResponse
	for rows.Next() {
		var module module_define.Module
		if err := rows.Scan(&module.Code, &module.Name, &module.Secret); err != nil {
			ctx.Error(err.Error())
			return scyna.SERVER_ERROR
		}

		m := scyna_proto.Module{
			Code:        module.Code,
			Name:        module.Name,
			Description: module.Description,
			Secret:      module.Secret,
		}
		response.Items = append(response.Items, &m)
	}
	return ctx.OK(&response)
}
