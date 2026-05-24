package scyna.event;

import static org.junit.Assert.fail;

import java.io.IOException;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;
import com.google.protobuf.Message;
import io.nats.client.JetStreamApiException;
import io.nats.client.PullSubscribeOptions;
import io.nats.client.api.AckPolicy;
import io.nats.client.api.ConsumerConfiguration;
import io.nats.client.api.StreamConfiguration;
import scyna.Engine;
import scyna.Trace;

public class EventManager {
    static Map<String, Stream> streams = new HashMap<String, Stream>();

    public static void start() throws Exception {
        for (var stream : streams.values()) {
            stream.start();
        }
    }

    public static class Stream {
        String sender;
        String receiver;
        Map<String, IEvent> executors;

        Stream(String sender, String receiver) {
            this.sender = sender;
            this.receiver = receiver;
            executors = new HashMap<String, IEvent>();
        }

        private static Stream createOrGet(String sender)
                throws TimeoutException, InterruptedException, IOException, JetStreamApiException {
            var stream = streams.get(sender);
            if (stream != null)
                return stream;

            stream = new Stream(sender, Engine.Module());
            streams.put(sender, stream);
            return stream;
        }

        void start() throws Exception {

            createStreamIfMissing(sender);
            createConsumerIfMissing(sender, receiver);

            var opt = PullSubscribeOptions.builder()
                    .durable(receiver)
                    .stream(sender)
                    .build();

            var sub = Engine.Stream().subscribe(sender + ".>", opt);
            Engine.Connection().flush(Duration.ofSeconds(1));

            new Thread(() -> {
                while (true) {
                    var messages = sub.fetch(1, Duration.ofSeconds(1));
                    for (io.nats.client.Message m : messages) {
                        var executor = executors.get(m.getSubject());
                        if (executor != null) {
                            executor.onMessage(m);
                        }
                        m.ack();
                    }
                }
            }).start();
        }

        private void createStreamIfMissing(String sender) {
            try {
                var jsm = Engine.Connection().jetStreamManagement();
                if (jsm.getStreamNames().contains(sender)) {
                    return;
                }

                System.out.println("Create stream:" + sender);

                StreamConfiguration config = StreamConfiguration.builder()
                        .name(sender)
                        .subjects(sender + ".>")
                        .build();
                jsm.addStream(config);

            } catch (Exception e) {
                e.printStackTrace();
                fail("Error in creating stream:" + sender);
            }
        }

        private void createConsumerIfMissing(String sender, String receiver) {
            try {
                var jsm = Engine.Connection().jetStreamManagement();

                var list = jsm.getConsumerNames(sender);

                for (var consumer : list) {
                    if (consumer.equals(receiver)) {
                        return;
                    }
                }

                System.out.println("Create consumner:" + sender + "." + receiver);

                ConsumerConfiguration config = ConsumerConfiguration.builder()
                        .durable(receiver)
                        .ackPolicy(AckPolicy.Explicit)
                        .build();
                jsm.addOrUpdateConsumer(sender, config);
            } catch (Exception e) {
                e.printStackTrace();
                fail("Error in creating stream:" + sender);
            }
        }

    }

    public static <T extends Message> void Register(String sender, String channel, Event<T> handler)
            throws Exception {
        System.out.println("Register Event:" + channel);

        var stream = Stream.createOrGet(sender);
        var subject = sender + "." + channel;
        var trace = Trace.Event(subject);
        handler.init(trace);
        stream.executors.put(subject, handler);
    }

    public static <T extends Message> void Register(String sender, String channel, Task<T> handler)
            throws Exception {
        System.out.println("Register Task:" + channel);
        var subject = sender + "." + channel;
        var trace = Trace.Task(subject);
        handler.init(trace);
        var stream = Stream.createOrGet(sender);
        stream.executors.put(subject, handler);
    }
}