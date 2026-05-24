package scyna;

public class Error extends java.lang.Exception {
    String code;
    String message;

    public static final Error OK = New("OK", "Success");
    public static final Error SERVER_ERROR = New("ServerError", "Server Error");
    public static final Error BAD_REQUEST = New("BadRequest", "Bad Request");
    public static final Error PERMISSION_ERROR = New("PermissionError", "Permission Error");
    public static final Error REQUEST_INVALID = New("RequestInvalid", "Request Invalid");
    public static final Error MODULE_NOT_EXIST = New("ModuleNotExists", "Module Not Exist");
    public static final Error BAD_DATA = New("BadData", "Bad Data");
    public static final Error STREAM_ERROR = New("StreamError", "Stream Error");

    public static final Error OBJECT_NOT_FOUND = New("ObjectNotFound", "Object Not Found");
    public static final Error OBJECT_EXISTS = New("ObjectExists", "Object Exists");

    public static final Error COMMAND_NOT_COMPLETED = New("CommandNotCompleted", "Command Not Completed");
    public static final Error EVENT_STORE_NULL = New("EventStoreIsNull", "EventStore Is Null");
    public static final Error API_CALL_ERROR = New("ApiCallError", "Api Call Error");

    public Error(String code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }

    private Error(String code) {
        super("");
        this.code = code;
    }

    public static Error New(String code, String message) {
        return new Error(code, message);
    }

    public static void Throw(String code) throws Error {
        throw new Error(code);
    }

    public scyna.proto.Error toProto() {
        return scyna.proto.Error.newBuilder().setCode(code).setMessage(message).build();
    }

    public String getCode() {
        return code;
    }
}
