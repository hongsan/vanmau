#Golang
protoc -I=. --go_out=../scyna-go/proto scyna.proto
protoc -I=. --go_out=../scyna-go/proto error.proto
protoc -I=. --go_out=../scyna-go/proto task.proto
protoc -I=. --go_out=../scyna-go/proto session.proto
protoc -I=. --go_out=../scyna-go/proto setting.proto
protoc -I=. --go_out=../scyna-go/proto id.proto
protoc -I=. --go_out=../scyna-go/proto trace.proto
protoc -I=. --go_out=../scyna-go/proto alert.proto
protoc -I=. --go_out=../scyna-go/proto module.proto

#.NET
protoc -I=. --csharp_out=../scyna.net/proto scyna.proto
protoc -I=. --csharp_out=../scyna.net/proto error.proto
protoc -I=. --csharp_out=../scyna.net/proto task.proto
protoc -I=. --csharp_out=../scyna.net/proto session.proto
protoc -I=. --csharp_out=../scyna.net/proto setting.proto
protoc -I=. --csharp_out=../scyna.net/proto id.proto
protoc -I=. --csharp_out=../scyna.net/proto trace.proto
protoc -I=. --csharp_out=../scyna.net/proto alert.proto

#Java
protoc --java_out=../scyna-java/src/main/java/ scyna.proto
protoc --java_out=../scyna-java/src/main/java/ error.proto
protoc --java_out=../scyna-java/src/main/java/ task.proto
protoc --java_out=../scyna-java/src/main/java/ session.proto
protoc --java_out=../scyna-java/src/main/java/ setting.proto
protoc --java_out=../scyna-java/src/main/java/ id.proto
protoc --java_out=../scyna-java/src/main/java/ trace.proto
protoc --java_out=../scyna-java/src/main/java/ alert.proto