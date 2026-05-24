package scyna_test

import (
	"log"
	"testing"
	"time"

	scyna "github.com/scyna/core"
	scyna_proto "github.com/scyna/core/proto"
	scyna_utils "github.com/scyna/core/utils"
	"google.golang.org/protobuf/proto"
)

type domainEvent struct {
	event    proto.Message
	expected bool
}

type endpointTest struct {
	url              string
	request          proto.Message
	status           int32
	response         proto.Message
	errorCodeOnly    bool
	responseExpected bool

	channel      string
	event        proto.Message
	expected     bool
	domainEvents []domainEvent
}

func Endpoint(url string) *endpointTest {
	return &endpointTest{url: url, errorCodeOnly: false, status: 200}
}

func (t *endpointTest) WithRequest(request proto.Message) *endpointTest {
	t.request = request
	return t
}

func (t *endpointTest) WithOutputChannel(channel string) *endpointTest {
	t.channel = channel
	return t
}

func (t *endpointTest) ExpectResponse(response proto.Message) *endpointTest {
	t.status = 200
	t.response = response
	t.responseExpected = true
	return t
}

func (t *endpointTest) GotResponse(response proto.Message) *endpointTest {
	t.status = 200
	t.response = response
	t.responseExpected = false
	return t
}

func (t *endpointTest) ExpectSuccess() *endpointTest {
	t.status = 200
	return t
}

func (t *endpointTest) ExpectError(err scyna.Error) *endpointTest {
	t.errorCodeOnly = false
	t.status = 400
	t.response = &scyna_proto.Error{
		Code:    err.Code(),
		Message: err.Message(),
	}
	return t
}

func (t *endpointTest) ExpectErrorCode(code string) *endpointTest {
	t.errorCodeOnly = true
	t.status = 400
	t.response = &scyna_proto.Error{Code: code}
	return t
}

func (t *endpointTest) ExpectEvent(event proto.Message) *endpointTest {
	t.event = event
	t.expected = true
	return t
}

func (t *endpointTest) GotEvent(event proto.Message) *endpointTest {
	t.event = event
	t.expected = false
	return t
}

func (t *endpointTest) ExpectDomainEvent(event proto.Message) *endpointTest {
	t.domainEvents = append(t.domainEvents, domainEvent{event: event, expected: true})
	return t
}

func (t *endpointTest) GotDomainEvent(event proto.Message) *endpointTest {
	t.domainEvents = append(t.domainEvents, domainEvent{event: event, expected: false})
	return t
}

func (st *endpointTest) Run(t *testing.T) {
	streamName := scyna.Module()

	if len(st.channel) > 0 {
		createStream(streamName)
	}

	var res = st.callEndpoint(t)
	if st.status != res.Code {
		t.Fatalf("Expect status %d but actually %d with response %s", st.status, res.Code, string(res.Body))
	}

	if st.response != nil {
		tmp := proto.Clone(st.response)
		if err := proto.Unmarshal(res.Body, tmp); err != nil {
			t.Fatal("Can not parse response body")
		}

		if !st.responseExpected {
			proto.Merge(st.response, tmp)
		} else {
			if st.status == 200 {
				if !proto.Equal(tmp, st.response) {
					t.Fatal("Response not match, expected:", st.response, "but actually:", tmp)
				}
			} else {
				if err, ok := tmp.(*scyna_proto.Error); ok {
					if err.Code != st.response.(*scyna_proto.Error).Code {
						t.Fatal("Error code not match, expected:", st.response, "but actually:", tmp)
					}

					if !st.errorCodeOnly && err.Message != st.response.(*scyna_proto.Error).Message {
						t.Fatal("Error message not match, expected:", st.response, "but actually:", tmp)
					}

				} else {
					t.Fatal("Error code not match, expected:", st.response, "but actually:", tmp)
				}
			}
		}
	}

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

func (st *endpointTest) callEndpoint(t *testing.T) *scyna_proto.Response {
	req := scyna_proto.Request{TraceID: scyna.ID.Next(), JSON: false}
	res := scyna_proto.Response{}

	if st.request != nil {
		var err error
		if req.Body, err = proto.Marshal(st.request); err != nil {
			t.Fatal("Bad Request:", err)
		}
	}

	if data, err := proto.Marshal(&req); err == nil {
		if msg, err := scyna.Nats.Request(scyna_utils.PublishURL(st.url), data, 10*time.Second); err == nil {
			if err := proto.Unmarshal(msg.Data, &res); err != nil {
				t.Fatal("Server Error:", err)
			}
		} else {
			t.Fatal("Server Error:", err)
		}
	} else {
		t.Fatal("Bad Request:", err)
	}

	return &res
}
