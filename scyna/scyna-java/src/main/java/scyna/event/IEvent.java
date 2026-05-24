package scyna.event;

interface IEvent {
    void onMessage(io.nats.client.Message msg);
}
