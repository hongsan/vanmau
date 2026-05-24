package scheduler

import (
	"log"
	"time"

	"github.com/gocql/gocql"
	scyna "github.com/scyna/core"
	scyna_const "github.com/scyna/core/const"
)

type worker struct {
}

func NewWorker() *worker {
	return &worker{}
}

func (w *worker) Start(delay time.Duration, interval time.Duration) {
	go func() {
		time.Sleep(delay)
		ticker := time.NewTicker(interval)
		for {
			select {
			case <-done:
				ticker.Stop()
				return
			case <-ticker.C:
				w.execute()
			}
		}
	}()
}

func (w *worker) execute() {
	bucket := GetBucket(time.Now())
	for {
		var tasks []int64

		scanners := scyna.DB.QueryMany("SELECT task_id FROM "+scyna_const.TODO_TABLE+" WHERE bucket = ? LIMIT 20", bucket)
		for scanners.Next() {
			var task int64
			if err := scanners.Scan(&task); err != nil {
				log.Println("scheduler.worker.execute: scan task: " + err.Error())
				return
			}
			tasks = append(tasks, task)
		}
		if len(tasks) == 0 {
			break
		}

		for _, task := range tasks {
			if applied, _ := scyna.DB.Apply("INSERT INTO "+scyna_const.DOING_TABLE+
				" (bucket, task_id) VALUES (?, ?) IF NOT EXISTS USING TTL 60", bucket, task); applied {
				w.process(bucket, task)
			}
		}
	}
}

func (w *worker) process(bucket int64, id int64) {
	var t task
	if err := scyna.DB.QueryOne("SELECT id, topic, data, next, interval, loop_index, loop_count, done FROM "+scyna_const.TASK_TABLE+
		" WHERE id = ? LIMIT 1", id).Scan(&t.ID, &t.Topic, &t.Data, &t.Next, &t.Interval, &t.LoopIndex, &t.LoopCount, &t.Done); err != nil {
		log.Println("Can not load task:", err.Error())
		scyna.DB.Execute("DELETE FROM "+scyna_const.TODO_TABLE+" WHERE bucket = ? AND task_id = ?;", bucket, id)
		return
	}
	log.Println("Execute task:", t.ID, t.Topic, t.Done)
	if bucket != GetBucket(t.Next) {
		return
	}

	if t.Done {
		deleteBatch := scyna.DB.Session.NewBatch(gocql.LoggedBatch)
		deleteBatch.Query("DELETE FROM "+scyna_const.DOING_TABLE+" WHERE bucket = ? AND task_id = ?", bucket, id)
		deleteBatch.Query("DELETE FROM "+scyna_const.TODO_TABLE+" WHERE bucket = ? AND task_id = ?", bucket, id)

		if err := scyna.DB.Session.ExecuteBatch(deleteBatch); err != nil {
			scyna.Session.Error(err.Error())
		}
		return
	}

	scyna.JetStream.Publish(t.Topic, t.Data) /*activate task handler*/

	qBatch := scyna.DB.Session.NewBatch(gocql.LoggedBatch)
	qBatch.Query("DELETE FROM "+scyna_const.TODO_TABLE+" WHERE bucket = ? AND task_id = ?;", bucket, id) /* remove old task from todolist */

	t.LoopIndex++
	if t.LoopIndex < t.LoopCount {
		t.Next = t.Next.Add(time.Second * time.Duration(t.Interval)) /* calculate next */
		nextBucket := GetBucket(t.Next)
		qBatch.Query("INSERT INTO "+scyna_const.TODO_TABLE+" (bucket, task_id) VALUES (?, ?);", nextBucket, t.ID) /* add new task to todo list */
		qBatch.Query("UPDATE "+scyna_const.TASK_TABLE+" SET next = ?, loop_index = ?  WHERE id = ?;", t.Next, t.LoopIndex, t.ID)
	} else {
		qBatch.Query("UPDATE "+scyna_const.TASK_TABLE+" SET done = true WHERE id = ?;", t.ID)
	}

	if err := scyna.DB.Session.ExecuteBatch(qBatch); err != nil {
		scyna.Session.Error(err.Error())
	}
}
