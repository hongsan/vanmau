package scyna_test

import (
	"log"
	"testing"
	"time"

	scyna "github.com/scyna/core"
	scyna_proto "github.com/scyna/core/proto"
	"google.golang.org/protobuf/proto"
)

type domainEventTest[R proto.Message] struct {
	channel      string
	event        proto.Message
	expected     bool
	domainEvents []domainEvent
	handler      scyna.DomainEventHandler[R]
	input        R
}

func DomainEvent[R proto.Message](handler scyna.DomainEventHandler[R]) *domainEventTest[R] {
	return &domainEventTest[R]{handler: handler}
}

func (t *domainEventTest[R]) WithData(event R) *domainEventTest[R] {
	t.input = event
	return t
}

func (t *domainEventTest[R]) WithOutputChannel(channel string) *domainEventTest[R] {
	t.channel = channel
	return t
}

func (t *domainEventTest[R]) ExpectEvent(event proto.Message) *domainEventTest[R] {
	t.event = event
	t.expected = true
	return t
}

func (t *domainEventTest[R]) GotEvent(event proto.Message) *domainEventTest[R] {
	t.event = event
	t.expected = false
	return t
}

func (t *domainEventTest[R]) ExpectDomainEvent(event proto.Message) *domainEventTest[R] {
	t.domainEvents = append(t.domainEvents, domainEvent{event: event, expected: true})
	return t
}

func (t *domainEventTest[R]) GotDomainEvent(event proto.Message) *domainEventTest[R] {
	t.domainEvents = append(t.domainEvents, domainEvent{event: event, expected: false})
	return t
}

func (st *domainEventTest[R]) Run(t *testing.T) {
	streamName := scyna.Module()
	if len(st.channel) > 0 {
		createStream(streamName)
	}

	ctx := scyna.NewEvent(scyna.ID.Next())
	st.handler(ctx, st.input)

	if len(st.domainEvents) == 0 {
		time.Sleep(time.Millisecond * 100)
	}

	for _, event := range st.domainEvents {
		receivedEvent := nextDomainEvent()
		if receivedEvent == nil {
			t.Fatal("No event received")
		}

		if event.expected {
			if !proto.Equal(event.event, receivedEvent) {
				t.Fatal("Event not match")
			}
		} else {
			proto.Merge(event.event, receivedEvent)
		}
	}

	if len(st.channel) > 0 {
		subs, err := scyna.JetStream.SubscribeSync(streamName + "." + st.channel)
		if err != nil {
			t.Fatal("Error in subscribe")
		}

		msg, err := subs.NextMsg(time.Second * 5)
		if err != nil {
			t.Fatal("Timeout")
		}

		var event scyna_proto.Event

		if err := proto.Unmarshal(msg.Data, &event); err != nil {
			log.Print("Register unmarshal error response data:", err.Error())
			t.Fatal("Can not parse received event")
		}

		if st.event != nil {
			receivedEvent := proto.Clone(st.event)
			if proto.Unmarshal(event.Body, receivedEvent) != nil {
				t.Fatal("Can not parse received event")
			}
			if st.expected {
				if !proto.Equal(st.event, receivedEvent) {
					t.Fatal("Event not match, expected:", st.event, "but actually:", receivedEvent)
				}
			} else {
				proto.Merge(st.event, receivedEvent)
			}
		}

		subs.Unsubscribe()
		deleteStream(streamName)
	}
}
