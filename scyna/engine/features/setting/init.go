package setting

import (
	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
)

func init() {
	scyna.RegisterEndpoint(scyna_const.SETTING_LIST_URL, ListSettingHandler)
	scyna.RegisterEndpoint(scyna_const.SETTING_READ_URL, ReadHandler)
	scyna.RegisterEndpoint(scyna_const.SETTING_REMOVE_URL, RemoveHandler)
	scyna.RegisterEndpoint(scyna_const.SETTING_UPDATE_URL, UpdateSettingHandler)
	scyna.RegisterEndpoint(scyna_const.SETTING_WRITE_URL, WriteHandler)
}
