package scheduler

import (
	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
)

func init() {
	scyna.RegisterEndpoint(scyna_const.START_TASK_URL, StartTask)
	scyna.RegisterEndpoint(scyna_const.STOP_TASK_URL, StopTask)
}
