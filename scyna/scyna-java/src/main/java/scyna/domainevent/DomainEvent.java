package scyna.domainevent;

import java.lang.reflect.ParameterizedType;
import com.google.protobuf.Message;

import scyna.Context;
import scyna.Error;
import scyna.Trace;
import scyna.domainevent.EventQueue.EventData;

public abstract class DomainEvent<T extends Message> implements IDomainEvent {
    protected T data;
    protected Context context;

    public abstract void execute() throws scyna.Error;

    protected void onError(Exception e) {
        context.error(e.getStackTrace().toString());
    }

    @SuppressWarnings("unchecked")
    public void EventReceived(EventData event) {
        this.data = (T) event.data;
        context = new Context(event.traceID);
        var trace = Trace.DomainEvent(this.getClass().getName(), event.traceID);
        try {
            execute();
        } catch (scyna.Error e) {
            if (e == Error.COMMAND_NOT_COMPLETED) {
                for (int i = 0; i < 5; i++) {
                    if (retry())
                        return;
                }
            }
            onError(e);
        } catch (Exception e) {
            onError(e);
        }
        trace.record();
    }

    private boolean retry() {
        try {
            this.execute();
        } catch (scyna.Error e) {
            if (e == Error.COMMAND_NOT_COMPLETED)
                return false;
            onError(e);
        } catch (Exception e) {
            System.out.println("Retry Error:" + e.getMessage());
            onError(e);
        }
        return true;
    }

    @SuppressWarnings("unchecked")
    public void TestEventReceived(EventData event) throws Error {
        var trace = Trace.DomainEvent(this.getClass().getName(), event.traceID);
        this.data = (T) event.data;
        context = new Context(event.traceID);
        execute();
        trace.record();
    }

    @SuppressWarnings("unchecked")
    Class<T> getEventType() {
        return (Class<T>) ((ParameterizedType) getClass().getGenericSuperclass())
                .getActualTypeArguments()[0];
    }
}
