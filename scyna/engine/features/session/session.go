package session

import (
	"log"
	"time"

	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
)

func newSession(module string, secret string) (uint64, scyna.Error) {
	var secret_ string
	if err := scyna.DB.QueryOne("SELECT secret FROM "+scyna_const.MODULE_TABLE+
		" WHERE code = ?", module).Scan(&secret_); err != nil {
		log.Print("Module not existed: ", err.Error())
		return 0, scyna.MODULE_NOT_EXISTS
	}

	if secret != secret_ {
		log.Print("Module secret is not correct")
		return 0, scyna.PERMISSION_ERROR
	}

	sid := scyna.ID.Next()
	now := time.Now()

	if err := scyna.DB.Execute("INSERT INTO "+scyna_const.SESSION_TABLE+
		" (id, module, started, state) VALUES (?, ?, ?, ?)",
		sid, module, now, "RUNNING"); err != nil {
		log.Print("Can not save session to database:", err)
		return 0, scyna.SERVER_ERROR
	}
	return sid, scyna.OK
}
