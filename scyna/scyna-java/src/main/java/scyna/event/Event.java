package scyna.event;

import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import com.google.protobuf.Message;
import com.google.protobuf.Parser;
import scyna.Context;
import scyna.Error;
import scyna.Trace;

public abstract class Event<T extends Message> implements IEvent {
    protected Context context = new Context(0);
    protected Parser<T> parser;
    protected T data;
    protected Trace trace;
    protected long entity;
    protected long version;

    public abstract void execute() throws scyna.Error;

    @SuppressWarnings("unchecked")
    public void init(Trace trace) throws Exception {
        Class<T> cls = (Class<T>) ((ParameterizedType) getClass().getGenericSuperclass())
                .getActualTypeArguments()[0];
        Method m = cls.getMethod("parser");
        this.parser = (Parser<T>) m.invoke(null);
        this.trace = trace;
    }

    @Override
    public void onMessage(io.nats.client.Message msg) {
        messageReceived(msg.getData());
    }

    public void messageReceived(byte[] data) {
        try {
            var event = scyna.proto.Event.parseFrom(data);
            trace.reset(event.getTraceID());
            context = new Context(event.getTraceID());
            this.data = parser.parseFrom(event.getBody());
            this.execute();
            trace.record();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}