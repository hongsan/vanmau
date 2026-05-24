SERVICE="../../services"

# Check protoc
if command -v protoc &>/dev/null; then
  echo "[OK] protoc found: $(protoc --version)"
else
  echo "[ERROR] protoc not found. Please install protobuf: https://grpc.io/docs/protoc-installation/"
  exit 1
fi

#cleanup
rm -rf ./proto/*
rm -rf ./src/dto
mkdir -p ./src/dto
mkdir -p ./proto/authenticating
mkdir -p ./proto/editing

#scyna error
cp ../../scyna/proto/error.proto proto

# authenticating
cp $SERVICE/authenticating/features/content_manager/cm-authenticating.proto proto/authenticating
cp $SERVICE/authenticating/gateway/websocket.proto proto/authenticating

# editing
cp $SERVICE/editing/src/main/java/poc/editing/features/creating/creating-commands.proto proto/editing
cp $SERVICE/editing/src/main/java/poc/editing/features/creating/creating-queries.proto proto/editing

# Generate using protoc directly to handle duplicates
find proto -name "*.proto" -exec protoc --plugin=./node_modules/.bin/protoc-gen-es --es_out=src/dto --es_opt=target=ts {} \;

protoc --plugin=./node_modules/.bin/protoc-gen-es --es_out=src/dto google/protobuf/timestamp.proto
protoc --plugin=./node_modules/.bin/protoc-gen-es --es_out=src/dto google/protobuf/duration.proto
protoc --plugin=./node_modules/.bin/protoc-gen-es --es_out=src/dto google/protobuf/struct.proto
protoc --plugin=./node_modules/.bin/protoc-gen-es --es_out=src/dto google/protobuf/wrappers.proto
