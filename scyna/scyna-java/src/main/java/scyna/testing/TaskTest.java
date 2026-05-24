package scyna.testing;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;
import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.Message;
import com.google.protobuf.Parser;

import scyna.Error;
import scyna.Trace;
import scyna.domainevent.EventQueue;
import scyna.event.Task;

public class TaskTest<T extends Message> extends BaseTest<TaskTest<T>> {
    private Message data = null;
    private Task<T> handler = null;
    Error error = null;

    TaskTest(Task<T> handler) {
        this.handler = handler;
    }

    public TaskTest<T> withData(Message data) {
        this.data = data;
        return this;
    }

    public TaskTest<T> expectError(scyna.Error error) {
        this.error = error;
        return this;
    }

    public Result run() throws Exception {
        assertNotNull("Input is null", data);
        createStream();
        EventQueue.Instance().clear();

        var trace = Trace.Event("");
        handler.init(trace);

        scyna.proto.Event event = scyna.proto.Event.newBuilder()
                .setTraceID(0)
                .setBody(data.toByteString())
                .build();

        handler.messageReceived(event.toByteArray());

        receiveDomainEvents();
        receiveEvent();
        deleteStream();
        return new Result(this);
    }

    public class Result {
        private TaskTest<T> test;

        Result(TaskTest<T> test) {
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
