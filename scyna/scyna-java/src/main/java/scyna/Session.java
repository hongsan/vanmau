package scyna;

import java.util.Timer;
import java.util.TimerTask;

import scyna.proto.EndSessionSignal;
import scyna.proto.UpdateSessionSignal;

public class Session {
    private final long id;
    private long sequence;

    public Session(long id) {
        this.id = id;

        TimerTask task = new TimerTask() {
            public void run() {
                Signal.emit(Path.SESSION_UPDATE_CHANNEL, UpdateSessionSignal.newBuilder().setID(id).build());
            }
        };

        Timer timer = new Timer();
        timer.schedule(task, 1000L * 60 * 5);
        Runtime.getRuntime().addShutdownHook(new Thread() {
            public void run() {
                timer.cancel();
                task.cancel();

                Signal.emit(Path.SESSION_END_CHANNEL, EndSessionSignal.newBuilder()
                        .setID(id)
                        .setCode(1)
                        .setModule(Engine.Module())
                        .build());
            }
        });
    }

    public long ID() {
        return id;
    }

    public synchronized long nextSequence() {
        sequence++;
        return sequence;
    }
}
