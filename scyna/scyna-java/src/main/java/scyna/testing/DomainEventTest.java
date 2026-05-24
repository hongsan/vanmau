package scyna.testing;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;
import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.Message;
import com.google.protobuf.Parser;

import scyna.Engine;
import scyna.Error;
import scyna.domainevent.DomainEvent;
import scyna.domainevent.EventQueue;

public class DomainEventTest<T extends Message> extends BaseTest<DomainEventTest<T>> {
    private Message data = null;
    private DomainEvent<T> handler = null;
    Error error = null;

    DomainEventTest(DomainEvent<T> handler) {
        this.handler = handler;
    }

    public DomainEventTest<T> withData(Message data) {
        this.data = data;
        return this;
    }

    public DomainEventTest<T> expectError(scyna.Error error) {
        this.error = error;
        return this;
    }

    public Result run() {
        assertNotNull("Input must not be null", data);
        createStream();
        EventQueue.Instance().clear();
        try {
            handler.TestEventReceived(new EventQueue.EventData(Engine.ID().next(), data));
        } catch (Error e) {
            if (error != null) {
                assertEquals(error, e);
            } else {
                fail("Must be success");
            }
            e.printStackTrace();
        }
        receiveDomainEvents();
        receiveEvent();
        deleteStream();
        return new Result(this);
    }

    public class Result {
        private DomainEventTest<T> test;

        Result(DomainEventTest<T> test) {
            this.test = test;
        }

        public <E extends Message> E parseEvent(Parser<E> parser) {
            try {
                return parser.parseFrom(test.eventData);
            } catch (InvalidProtocolBufferException e) {
                fail("Error in parsing event");
            }
            return null;
        }

        public <E extends Message> E parseNextDomainEvent(Parser<E> parser) {
            try {
                return parser.parseFrom(EventQueue.Instance().nextEvent().toByteArray());
            } catch (Exception e) {
                fail("Error in parsing domain event");
            }
            return null;
        }
    }
}
