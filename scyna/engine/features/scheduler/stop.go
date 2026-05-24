package scheduler

import (
	"log"

	"github.com/gocql/gocql"
	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
	scyna_proto "github.com/scyna/core/proto"
)

func StopTask(ctx *scyna.Endpoint, request *scyna_proto.StopTaskRequest) scyna.Error {
	qBatch := scyna.DB.Session.NewBatch(gocql.LoggedBatch)
	qBatch.Query("UPDATE "+scyna_const.TASK_TABLE+" SET done = ? WHERE id = ?", true, request.Id)

	scanners := scyna.DB.QueryMany("SELECT task_id, bucket FROM " + scyna_const.TODO_TABLE)
	for scanners.Next() {
		var taskId int64
		var bucket int64
		if err := scanners.Scan(&taskId, &bucket); err != nil {
			log.Println("StopTask: scan task: " + err.Error())
		}
		if taskId == int64(request.Id) {
			qBatch.Query("DELETE FROM "+scyna_const.TODO_TABLE+" WHERE bucket = ? AND task_id = ?;", bucket, taskId)
		}
	}
	if err := scyna.DB.Session.ExecuteBatch(qBatch); err != nil {
		ctx.Error(err.Error())
		return scyna.REQUEST_INVALID
	}
	return scyna.OK
}
