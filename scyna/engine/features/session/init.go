package session

import (
	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
)

func init() {
	scyna.RegisterSignal(scyna_const.SESSION_END_CHANNEL, EndHandler)
	scyna.RegisterSignal(scyna_const.SESSION_UPDATE_CHANNEL, UpdateHandler)
}

func Init(module string, secret string) {
	if id, err := newSession(module, secret); err != scyna.OK {
		panic("Error in create session")
	} else {
		scyna.Session = scyna.NewSession(id)
	}
}
