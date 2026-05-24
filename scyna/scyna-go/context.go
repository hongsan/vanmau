package scyna

import (
	"fmt"
	scyna_const "github.com/scyna/core/const"
	scyna_proto "github.com/scyna/core/proto"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/timestamppb"
	"log"
	"runtime"
)

type Context struct {
	ID uint64
}

func (ctx *Context) TraceID() uint64 {
	return ctx.ID
}

func (ctx *Context) Task(channel string) *taskBuilder {
	return &taskBuilder{ctx: ctx, channel: channel}
}

func (ctx *Context) RaiseDomainEvent(event proto.Message) {
	go func() {
		eventQueue <- eventItem{Data: event, parentTrace: ctx.ID}
	}()
}

func (ctx *Context) PublishEvent(channel string, data proto.Message) Error {
	event := scyna_proto.Event{TraceID: ctx.ID}
	if data, err := proto.Marshal(data); err != nil {
		return BAD_DATA
	} else {
		event.Body = data
	}

	if data, err := proto.Marshal(&event); err != nil {
		return BAD_DATA
	} else {
		if _, err := JetStream.Publish(buildSubject(module, channel), data); err != nil {
			return STREAM_ERROR
		}
	}
	return nil
}

func (ctx *Context) PublishAlert(key string, title string, message string, severity ...scyna_proto.AlertSeverity) Error {
	sev := scyna_proto.AlertSeverity_DEFAULT
	if len(severity) > 0 {
		sev = severity[0]
	}

	_, file, line, ok := runtime.Caller(1)
	if ok {
		message = fmt.Sprintf("[%s:%d]<br>%s", file, line, message)
	}

	alertData := scyna_proto.AlertCreated{
		Key:      key,
		Created:  timestamppb.Now(),
		Module:   module,
		Title:    title,
		Message:  message,
		Severity: sev,
	}

	event := scyna_proto.Event{TraceID: ctx.ID}
	if data, err := proto.Marshal(&alertData); err != nil {
		return BAD_DATA
	} else {
		event.Body = data
	}

	if data, err := proto.Marshal(&event); err != nil {
		return BAD_DATA
	} else {
		if _, err := JetStream.Publish(
			buildSubject("scyna_engine", scyna_const.ALERT_CREATED),
			data); err != nil {
			return STREAM_ERROR
		}
	}
	return nil
}

func (ctx *Context) PublishAlertToDeveloper(title string, message string, severity ...scyna_proto.AlertSeverity) Error {
	return ctx.PublishAlert("developer", title, message, severity...)
}

func (ctx *Context) PublishAlertToOperator(title string, message string, severity ...scyna_proto.AlertSeverity) Error {
	return ctx.PublishAlert("operator", title, message, severity...)
}

func (ctx *Context) SendRequest(url string, request proto.Message, response proto.Message) Error {
	trace := createTrace(url, TRACE_ENDPOINT, ctx.ID)
	return sendRequest_(trace, url, request, response)
}

func (l *Context) writeLog(level LogLevel, message string) {
	message = formatLog(message)
	log.Print(message)
	if l.ID > 0 {
		AddLog(LogData{
			ID:       l.ID,
			Sequence: Session.NextSequence(),
			Level:    level,
			Message:  message,
		})
	}
}

func (l *Context) Info(messsage string) {
	l.writeLog(LOG_INFO, messsage)
}

func (l *Context) Error(messsage string) {
	l.writeLog(LOG_ERROR, messsage)
}

func (l *Context) Warning(messsage string) {
	l.writeLog(LOG_WARNING, messsage)
}

func (l *Context) Debug(messsage string) {
	l.writeLog(LOG_DEBUG, messsage)
}

func (l *Context) Fatal(messsage string) {
	l.writeLog(LOG_FATAL, messsage)
}
