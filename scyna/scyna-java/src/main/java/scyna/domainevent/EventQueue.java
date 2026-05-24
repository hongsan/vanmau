package scyna.domainevent;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.TimeUnit;
import com.google.protobuf.Message;

public class EventQueue {
    private EventQueue() {
    }

    private static EventQueue instance;

    public static EventQueue Instance() {
        if (instance == null)
            instance = new EventQueue();
        return instance;
    }

    public static <T extends Message> void Register(DomainEvent<T> handler) {
        Instance().register(handler);
    }

    public static class EventData {
        long traceID;
        Message data;

        public EventData(long traceID, Message data) {
            this.traceID = traceID;
            this.data = data;
        }
    }

    private final BlockingQueue<EventData> events = new LinkedBlockingDeque<EventData>();
    private final Map<Class<?>, List<IDomainEvent>> handlers = new HashMap<Class<?>, List<IDomainEvent>>();

    public <T extends Message> void register(DomainEvent<T> handler) {
        var type = handler.getEventType();
        System.out.println("Register EventStream:" + type.getName());
        if (handlers.containsKey(type)) {
            var list = handlers.get(type);
            list.add(handler);
        } else {
            var list = new LinkedList<IDomainEvent>();
            list.add(handler);
            handlers.put(type, list);
        }
    }

    public void clear() {
        events.clear();
    }

    public void addEvent(long traceID, Message data) {
        events.add(new EventData(traceID, data));
    }

    private void run() {
        while (true) {
            try {
                var item = events.poll(5, TimeUnit.SECONDS);
                if (item == null)
                    continue;
                var type = item.data.getClass();
                if (handlers.containsKey(type)) {
                    var list = handlers.get(type);
                    for (var handler : list) {
                        handler.EventReceived(item);
                    }
                } else
                    System.out.println("EventStream: no handler for " + type.getName());
            } catch (InterruptedException e) {
                /* do nothing */
            }
        }
    }

    public void start() {
        new Thread(() -> run()).start();
    }

    public Message nextEvent() {
        try {
            var item = events.poll(10, TimeUnit.SECONDS);
            if (item == null)
                return null;
            return item.data;
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return null;
    }
}
