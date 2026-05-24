package scyna;

import com.google.protobuf.ByteString;
import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.Message;
import com.google.protobuf.Parser;
import com.google.protobuf.util.JsonFormat;

import br.com.fluentvalidator.AbstractValidator;
import io.nats.client.MessageHandler;
import scyna.proto.EndpointDoneSignal;
import scyna.proto.Request;
import scyna.proto.Response;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;

public abstract class Endpoint<T extends Message> implements MessageHandler {

    protected Context context;
    protected boolean JSON;

    protected String reply;
    protected boolean flushed = false;

    protected T request;
    protected Parser<T> parser;
    protected Message.Builder builder;
    private String requestBody = "";
    private AbstractValidator<T> validator = null;
    protected ByteString metadata = null;

    protected abstract void execute() throws scyna.Error;
    protected void authenticate() throws scyna.Error{/* do nothing */};
    public void registerMe(String url) {/* do nothing */};

    protected void reply(Message m) {
        flush(200, m);
    }

    protected void flush(int status, Message m) {
        try {
            byte[] body;
            if (JSON) {
                body = com.google.protobuf.util.JsonFormat.printer().print(m).getBytes();
            } else {
                body = m.toByteArray();
            }
            var response = Response.newBuilder()
                    .setCode(status)
                    .setBody(ByteString.copyFrom(body)).build();
            Engine.Connection().publish(reply, response.toByteArray());
            flushed = true;
            finish(response, status);
        } catch (InvalidProtocolBufferException e) {
            e.printStackTrace();
        }
    }

    private void finish(Message response, int status) {
        if (context.id == 0) {
            return;
        }

        try {
            String responseJson;
            try {
                responseJson = JsonFormat.printer().print(response);
            } catch (UnsupportedOperationException e) {
                responseJson = "";
            }
            Signal.emit(scyna.Path.ENDPOINT_DONE_CHANNEL, EndpointDoneSignal.newBuilder()
                    .setTraceID(context.id)
                    .setResponse(responseJson)
                    .setRequest(requestBody)
                    .setStatus(status)
                    .setSessionID(Engine.Session().ID())
                    .build());
        } catch (InvalidProtocolBufferException e) {
            e.printStackTrace();
        }
    }

    @SuppressWarnings("unchecked")
    public void init() throws java.lang.Exception {
        try {
            Class<T> cls = (Class<T>) ((ParameterizedType) getClass().getGenericSuperclass())
                    .getActualTypeArguments()[0];
            Method m = cls.getMethod("newBuilder");
            builder = (Message.Builder) m.invoke(null);
            var tObj = builder.build();
            parser = (Parser<T>) tObj.getParserForType();

            var parent = getClass().getClasses();
            for (Class<?> p : parent) {
                if (p.getSimpleName().equals("Validator") && p.getSuperclass().equals(AbstractValidator.class)) {
                    Constructor<?> ctor = p.getConstructor();
                    this.validator = (AbstractValidator<T>) ctor.newInstance();
                    break;
                }
            }

        } catch (java.lang.Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    private void validateRequest() throws Error {
        if (validator == null)
            return;
        var result = validator.validate(request);
        if (!result.isValid()) {
            StringBuilder message = new StringBuilder();
            result.getErrors().forEach(e -> message.append(e.getMessage()).append(";"));
            throw new Error("RequestInvalid", message.toString());
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public void onMessage(io.nats.client.Message msg) {
        try {
            var request = Request.parseFrom(msg.getData());
            context = new Context(request.getTraceID());
            reply = msg.getReplyTo();
            JSON = request.getJSON();
            metadata = request.getData();
            flushed = false;
            var requestBody = request.getBody();

            if (JSON) {
                this.requestBody = requestBody.toStringUtf8();
                builder.clear();
                JsonFormat.parser().merge(requestBody.toStringUtf8(), builder);
                this.request = (T) builder.build();
                builder.clear();
            } else {
                this.request = parser.parseFrom(requestBody);
                try {
                    this.requestBody = JsonFormat.printer().print(this.request);
                } catch (UnsupportedOperationException e) {
                    this.requestBody = requestBody.toStringUtf8();
                }
            }

             if (Engine.testMode) {
                if (metadata != null && !metadata.isEmpty()) this.authenticate();
            } else {
                this.authenticate();
            }

            this.validateRequest();
            this.execute();

            if (!flushed) {
                flush(200, scyna.Error.OK.toProto());
            }
        } catch (scyna.Error e) {
            if (e == Error.COMMAND_NOT_COMPLETED) {
                for (int i = 0; i < 5; i++) {
                    if (retry())
                        return;
                }
                flush(400, scyna.Error.SERVER_ERROR.toProto());
            } else {
                context.error(e.getCode());
                flush(400, e.toProto());
            }
        } catch (InvalidProtocolBufferException e) {
            flush(400, scyna.Error.BAD_REQUEST.toProto());
        } catch (UnsupportedOperationException e) {
            System.err.println("[Endpoint] UnsupportedOperationException caught:");
            e.printStackTrace();
            flush(400, scyna.Error.SERVER_ERROR.toProto());
        }
    }

    private boolean retry() {
        try {
            this.execute();
            if (!flushed)
                flush(200, scyna.Error.OK.toProto());
        } catch (scyna.Error e) {
            if (e == Error.COMMAND_NOT_COMPLETED)
                return false;
            flush(400, e.toProto());
        } catch (Exception e) {
            System.out.println("Retry Error:" + e.getMessage());
            flush(400, scyna.Error.BAD_REQUEST.toProto());
        }
        return true;
    }
}
