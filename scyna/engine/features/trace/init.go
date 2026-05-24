package trace

import (
	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
)

func init() {
	scyna.RegisterSignal(scyna_const.TRACE_CREATED_CHANNEL, TraceCreatedHandler)
	scyna.RegisterSignal(scyna_const.ENDPOINT_DONE_CHANNEL, EndpointDoneHandler)
	scyna.RegisterSignal(scyna_const.LOG_CREATED_CHANNEL, LogCreatedHandler)
}
