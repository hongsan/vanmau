package scyna.domainevent;

import scyna.domainevent.EventQueue.EventData;

public interface IDomainEvent {
    void EventReceived(EventData data);
}
