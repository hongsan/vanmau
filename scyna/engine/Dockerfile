# Build stage
FROM golang:1.24.2-alpine AS build-env
ENV GO111MODULE=on
WORKDIR /workspace
COPY scyna scyna
WORKDIR /workspace/scyna/engine
RUN go mod tidy 
RUN go build -o ./application .

# Runtime stage
FROM alpine:3.21
WORKDIR /app
COPY --from=build-env /workspace/scyna/engine/application /application
ENV MANAGER_PORT=8081 \
	PROXY_PORT=8080 \
	NATS_URL=localhost \
	NATS_USERNAME="" \
	NATS_PASSWORD="" \
	DB_HOST="" \
	DB_USERNAME="" \
	DB_PASSWORD="" \
	DB_LOCATION="" \
	DB_PEM_FILE="" \
	CERTIFICATE_FILE="" \
	CERTIFICATE_KEY="" \
	CERTIFICATE_ENABLE=false \
	PASSWORD=""

EXPOSE $MANAGER_PORT $PROXY_PORT
CMD /application \
	--manager_port=${MANAGER_PORT} \
	--proxy_port=${PROXY_PORT} \
	--nats_url=${NATS_URL} \
	--nats_username=${NATS_USERNAME} \
	--nats_password=${NATS_PASSWORD} \
	--db_host=${DB_HOST} \
	--db_username=${DB_USERNAME} \
	--db_password=${DB_PASSWORD} \
	--db_location=${DB_LOCATION} \
	--db_pem_file=${DB_PEM_FILE} \
	--certificateFile=${CERTIFICATE_FILE} \
	--certificateKey=${CERTIFICATE_KEY} \
	-certificateEnable=${CERTIFICATE_ENABLE} \
	--secret=${PASSWORD}
