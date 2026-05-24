package scyna.testing;

import com.google.protobuf.Message;

import scyna.Endpoint;
import scyna.domainevent.DomainEvent;
import scyna.event.Event;
import scyna.event.Task;

public class Testing {
    public static <T extends Message, E extends Endpoint<T>> EndpointTest Endpoint(Class<E> clazz) {
        var ann = clazz.getAnnotation(scyna.EndpointPath.class);
        return new EndpointTest(ann.value());
    }

    public static <T extends Message> DomainEventTest<T> DomainEvent(DomainEvent<T> handler) {
        return new DomainEventTest<T>(handler);
    }

    public static <T extends Message> EventTest<T> Event(Event<T> handler) {
        return new EventTest<T>(handler);
    }

    public static <T extends Message> TaskTest<T> Task(Task<T> handler) {
        return new TaskTest<T>(handler);
    }
}
