import { Timestamp } from "@bufbuild/protobuf";
import { ListEditingPostResponse, ListEditingPostResponse_PostData } from "../dto/proto/editing/creating-queries_pb";
import { Mocking } from "../shared/mocking";

export function registerEditingCreating() {

	Mocking.register("poc/editing/cm/list-editing-post", Mocking.successFetcher(
		new ListEditingPostResponse({
			Posts: [
				new ListEditingPostResponse_PostData({
					PostID: BigInt(1),
					Title: "First Post",
					CreatedAt: Timestamp.fromDate(new Date("2024-01-01T10:00:00Z")),
				}),
				new ListEditingPostResponse_PostData({
					PostID: BigInt(2),
					Title: "Second Post",
					CreatedAt: Timestamp.fromDate(new Date("2024-01-02T12:00:00Z")),
				}),
				new ListEditingPostResponse_PostData({
					PostID: BigInt(3),
					Title: "Third Post",
					CreatedAt: Timestamp.fromDate(new Date("2024-01-03T14:00:00Z")),
				})
			]
		})));
		//Mocking.register("poc/editing/cm/list-editing-post", Mocking.successFetcher(new ListEditingPostResponse({Posts: []})));
		//Mocking.register("poc/editing/cm/list-editing-post", Mocking.failEndpoint("Error", "Failed to load posts", 1000));

		//Mocking.register("poc/editing/cm/add-post", Mocking.successExecutor(2000));
		Mocking.register("poc/editing/cm/add-post", Mocking.failEndpoint("Error", "Failed to add post", 2000));

}
