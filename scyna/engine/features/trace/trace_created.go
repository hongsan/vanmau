package trace

import (
	"fmt"
	"log"
	"strconv"
	"time"

	scyna "github.com/scyna/core"

	scyna_const "github.com/scyna/core/const"
	scyna_proto "github.com/scyna/core/proto"
	scyna_utils "github.com/scyna/core/utils"
)

func TraceCreatedHandler(signal *scyna_proto.TraceCreatedSignal) {

	now := time.Unix(0, int64(signal.Time))
	day := scyna_utils.GetDayByTime(now)

	if err := scyna.DB.Execute("INSERT INTO "+scyna_const.TRACE_TABLE+
		"(type, path, day, id, time, duration, session, status, source, parent, origin_ip)"+" VALUES (?,?,?,?,?,?,?,?,?,?,?)",
		signal.Type, signal.Path, day, signal.ID, now,
		signal.Duration, signal.SessionID, signal.Status, signal.Source, signal.ParentID, signal.OriginIP); err != nil {
		log.Print("Can not save trace created " + strconv.FormatUint(signal.ID, 10) + " / " + err.Error())
	}

	dayStats := fmt.Sprintf("trace.total.day.%d", day)
	hourStats := fmt.Sprintf("trace.total.hour.%d.%d", scyna_utils.GetDayByTime(now), now.Hour())
	minuteStats := fmt.Sprintf("trace.total.minute.%d.%d", scyna_utils.GetDayByTime(now), now.Hour()*60+now.Minute())

	batch := scyna.DB.CounterBatch().
		Add("UPDATE "+scyna_const.STATS_TABLE+" SET value=value+1 WHERE key=?;", dayStats).
		Add("UPDATE "+scyna_const.STATS_TABLE+" SET value=value+1 WHERE key=?;", hourStats).
		Add("UPDATE "+scyna_const.STATS_TABLE+" SET value=value+1 WHERE key=?;", minuteStats).
		Add("UPDATE "+scyna_const.ENDPOINT_MONITOR+" SET total=total+1 WHERE day=? AND path=?;", day, signal.Path)

	if err := batch.Execute(); err != nil {
		log.Println("Can not update stats" + err.Error())
	}
}
