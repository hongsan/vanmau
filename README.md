# README
1. Techstack
   - BE
      - Cassandra/Scylladb (https://www.scylladb.com/)
      - NATS (https://nats.io/)
      - Protocol Buffers (https://protobuf.dev/)
   - FE
      - Web Component/lit-element (https://lit.dev/)
      - Web Awesome (https://webawesome.com/)
      - Protocol Buffers (https://protobuf.dev/)

2. **Cài đặt môi trường**
   - BE:
     - ScyllaDB
     - NATS
     - Dotnet: `8.0.0`
     - go version: `go1.18.10`
     - protoc-gen-go: `v1.28.1`
     - libprotoc `3.12.4`
     - Java `17`
   - FE:
     - protoc-gen-go `v1.28.1`
     - libprotoc `3.12.4`
     - TODO

3. **Cấu trúc backend service**:
   - features: Define các API, handle các yêu cầu của service...
   - generated: Thư mục được tạo tự động sau khi chạy file generate.sh
   - model: Define data model, data base
   - shared: Define các enum dùng chung trong service, các hàm base sử dụng trong nhiều API

4. **How to setup and start Engine**
   - Open a terminal
   - Go to `scyna/engine/cql`, run `sh setup.sh`
   - Goto `scyna/engine`, run `go run engine.go`

5. **How to setup and start Authenticating**
   - Open a terminal
   - Go to `services/authenticating/model`, run `sh setup.sh`
   - Goto `services/authenticating`, run `go run main.go`

6. **How to setup and start Editing**
   - Open a terminal
   - Go to `services/editing/model`, run `sh setup.sh`
   - Goto `services/authenticating`, run `sh run.sh`