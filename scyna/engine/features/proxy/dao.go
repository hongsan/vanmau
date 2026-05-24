package proxy

import (
	"fmt"
	"log"
	"time"

	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
	scyna_utils "github.com/scyna/core/utils"
)

func saveTrace(trace *trace) {
	now := time.Now()
	day := scyna_utils.GetDayByTime(now)
	trace.Duration = uint64(now.UnixNano() - trace.Time.UnixNano())

	if err := scyna.DB.Execute("INSERT INTO "+scyna_const.TRACE_TABLE+
		"(type, path, day, id, time, duration, session, status, source, origin_ip) VALUES (?,?,?,?,?,?,?,?,?,?)",
		trace.Type, trace.Path, day, trace.ID, trace.Time, trace.Duration, trace.SessionID, trace.Status, trace.Source, trace.OriginIP); err != nil {
		scyna.Session.Error("Can not save trace - " + err.Error())
	}

	dayStats := fmt.Sprintf("trace.total.day.%d", day)
	hourStats := fmt.Sprintf("trace.total.hour.%d.%d", scyna_utils.GetDayByTime(now), now.Hour())
	minuteStats := fmt.Sprintf("trace.total.minute.%d.%d", scyna_utils.GetDayByTime(now), now.Hour()*60 + now.Minute())
	
	batch := scyna.DB.CounterBatch().
	Add("UPDATE " + scyna_const.STATS_TABLE + " SET value=value+1 WHERE key=?;",dayStats).
	Add("UPDATE " + scyna_const.STATS_TABLE + " SET value=value+1 WHERE key=?;",hourStats).
	Add("UPDATE " + scyna_const.STATS_TABLE + " SET value=value+1 WHERE key=?;",minuteStats).
	Add("UPDATE " + scyna_const.ENDPOINT_MONITOR + " SET total=total+1 WHERE day=? AND path=?;",day, trace.Path)
	
	if err := batch.Execute(); err != nil {
		log.Println("Can not update stats" + err.Error())
	} 

	//todo: implement alerting with request failure rate threshold
}
