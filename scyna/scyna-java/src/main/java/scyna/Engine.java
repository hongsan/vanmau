package scyna;

import java.io.IOException;
import java.lang.reflect.Constructor;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse.BodyHandlers;
import java.util.HashMap;
import java.util.Map;

import org.reflections.Reflections;

import com.google.protobuf.Message;

import io.nats.client.Connection;
import io.nats.client.JetStream;
import io.nats.client.Nats;
import scyna.db.DB;
import scyna.domainevent.DomainEvent;
import scyna.domainevent.EventQueue;
import scyna.event.Event;
import scyna.event.EventManager;
import scyna.event.EventPath;
import scyna.event.Task;
import scyna.eventstore.EventStore;
import scyna.eventstore.Projection;
import scyna.eventstore.Store;
import scyna.proto.Configuration;
import scyna.proto.CreateSessionRequest;
import scyna.proto.CreateSessionResponse;

public class Engine {
    private static Engine instance;
    private final Connection connection;
    private final Session session;
    private final Generator id;
    private final Logger logger;
    private String module;
    private final JetStream stream;
    private Settings settings;
    private final DB db;
    public static boolean testMode = false;
    private final Map<Class<?>, EventStore<?>> stores = new HashMap<Class<?>, EventStore<?>>();

    private Engine(String module, long sessionID, Configuration config) throws IOException, InterruptedException {
        this.module = module;
        id = new Generator();
        session = new Session(sessionID);
        logger = new Logger(sessionID);
        settings = new Settings();

        /* NATS */
        connection = Nats.connect(config.getNatsUrl()); // FIXME: hosts list and auth
        stream = connection.jetStream();
        System.out.println("Connected to NATS");

        /* ScyllaDB */
        var hosts = config.getDBHost().split(",");
        db = DB.Init(hosts, config.getDBUsername(), config.getDBPassword(), config.getDBLocation());
        System.out.println("Connected to ScyllaDB");
    }

    public static void TestInit(String prefix, String managerURL, String module, String secret)
            throws java.lang.Exception {
        testMode = true;
        Init(prefix, managerURL, module, secret);
    }

    public static void Init(String prefix, String managerURL, String module, String secret)
            throws java.lang.Exception {

        try {
            var req = CreateSessionRequest.newBuilder().setModule(module).setSecret(secret).build();
            var request = HttpRequest.newBuilder()
                    .uri(new URI(managerURL + Path.SESSION_CREATE_URL))
                    .POST(HttpRequest.BodyPublishers.ofByteArray(req.toByteArray()))
                    .build();
            var response = HttpClient.newBuilder().build().send(request, BodyHandlers.ofByteArray());
            if (response.statusCode() != 200) {
                throw new IOException("Error in create http request: " + response.statusCode());
            }
            var res = CreateSessionResponse.parseFrom(response.body());
            instance = new Engine(module, res.getSessionID(), res.getConfig());
            System.out.println("Engine created for module:" + module);

            /* setting */
            Signal.RegisterBySession(Path.SETTING_UPDATE_CHANNEL + module, new Settings.UpdateHandler());
        } catch (Exception e) {
            System.out.println("Can not connect to scyna engine: " + e);
        }
        Signal.RegisterBySession(Path.SETTING_REMOVE_CHANNEL + module, new Settings.RemoveHandler());

        instance.registerEventStores(prefix);
        instance.registerProjections(prefix);
        instance.registerEndpoints(prefix);
        if (!testMode) {
            instance.registerDomainEvents(prefix);
            instance.registerEvents(prefix);
            instance.registerTasks(prefix);
        }
    }

    public static Engine Instance() {
        return instance;
    }

    public static Generator ID() {
        return instance.id;
    }

    public static DB DB() {
        return instance.db;
    }

    public static Logger LOG() {
        return instance.logger;
    }

    public static Session Session() {
        return instance.session;
    }

    public static String Module() {
        return instance.module;
    }

    public static Connection Connection() {
        return instance.connection;
    }

    public static JetStream Stream() {
        return instance.stream;
    }

    public static Settings Settings() {
        return instance.settings;
    }

    public static void Release() {
        DB().close();
        System.out.println("Engine Closed");
    }

    public static void Start() throws Exception {
        EventManager.start();
        EventQueue.Instance().start();
        System.out.println("Engine Started");
    }

    public void registerEndpoints(String prefix) {
        Reflections reflections = new Reflections(prefix);

        reflections.getSubTypesOf(Endpoint.class).forEach(endpoint -> {
            try {
                Constructor<?> ctor = endpoint.getConstructor();
                var ep = (Endpoint<?>) ctor.newInstance();
                ep.init();
                var d = connection.createDispatcher(ep);

                var ann = endpoint.getAnnotation(EndpointPath.class);
                if (ann != null) {
                    System.out.println("Register Service:" + endpoint.getName());
                    d.subscribe(Utils.subscribeURL(ann.value()), "API");
                    if (!testMode) ep.registerMe(ann.value());
                    return;
                }
            } catch (java.lang.InstantiationException e) {
                //e.printStackTrace();
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    public void registerDomainEvents(String prefix) {
        Reflections reflections = new Reflections(prefix);

        reflections.getSubTypesOf(DomainEvent.class).forEach(domainEvent -> {
            try {
                Constructor<?> ctor = domainEvent.getConstructor();
                var handler = (DomainEvent<?>) ctor.newInstance();
                EventQueue.Register(handler);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    public void registerProjections(String prefix) {
        Reflections reflections = new Reflections(prefix);

        reflections.getSubTypesOf(Projection.class).forEach(projection -> {
            try {
                Constructor<?> ctor = projection.getConstructor();
                var handler = (Projection<?, ?>) ctor.newInstance();
                var cls = handler.init();
                var store = stores.get(cls);

                if (store == null) {
                    System.out.println("EventStore is not define");
                    System.exit(1);
                    return;
                }

                System.out.println("Register Projection:" + projection.getName());
                store.registerProjection(handler);
            } catch (Exception e) {
                e.printStackTrace();
                System.exit(1);
            }
        });
    }

    public void registerEventStores(String prefix) {
        Reflections reflections = new Reflections(prefix);

        reflections.getSubTypesOf(EventStore.class).forEach(store -> {
            try {
                var ann = store.getAnnotation(Store.class);
                if (ann != null) {
                    Constructor<?> ctor = store.getConstructor();
                    var handler = (EventStore<?>) ctor.newInstance();
                    System.out.println("Register EventStore:" + store.getName());
                    String table = ann.value();
                    var cls = handler.init(table);
                    stores.put(cls, handler);
                    return;
                }
            } catch (Exception e) {
                e.printStackTrace();
                System.exit(1);
            }
        });
    }

    public void registerEvents(String prefix) throws Exception {
        Reflections reflections = new Reflections(prefix);

        reflections.getSubTypesOf(Event.class).forEach(event -> {
            try {
                var ann = event.getAnnotation(EventPath.class);
                if (ann != null) {
                    Constructor<?> ctor = event.getConstructor();
                    var handler = (Event<?>) ctor.newInstance();
                    EventManager.Register(ann.sender(), ann.channel(), handler);
                    return;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    public void registerTasks(String prefix) throws Exception {
        Reflections reflections = new Reflections(prefix);

        reflections.getSubTypesOf(Task.class).forEach(event -> {
            try {
                var ann = event.getAnnotation(EventPath.class);
                if (ann != null) {
                    Constructor<?> ctor = event.getConstructor();
                    var handler = (Task<?>) ctor.newInstance();
                    EventManager.Register(ann.sender(), ann.channel(), handler);
                    return;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }

    @SuppressWarnings("unchecked")
    public static <D extends Message> EventStore<D> Store(Class<D> clazz) {
        return (EventStore<D>) Instance().stores.get(clazz);
    }
}
