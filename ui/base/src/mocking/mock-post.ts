import { Timestamp } from "@bufbuild/protobuf";
import { Mocking } from "../shared/mocking";
import { ListPostResponse, ListPostResponse_PostData } from "../dto/proto/pagination-list/list-post_pb";

export function registerPostMocking() {

	Mocking.register("base/post/list-post", Mocking.successFetcher(
		new ListPostResponse({
			Posts: [
				new ListPostResponse_PostData({
					PostID: BigInt(1),
					Title: "First Post",
					CreatedBy: {UserID: BigInt(1),Name: "Alice"},
					PublishedAt: Timestamp.fromDate(new Date("2024-01-01T10:00:00Z")),
				}),
				new ListPostResponse_PostData({
					PostID: BigInt(2),
					Title: "Second Post",
					CreatedBy: {UserID: BigInt(2),Name: "Bob"},
					PublishedAt: Timestamp.fromDate(new Date("2024-01-02T12:00:00Z")),
				}),
				new ListPostResponse_PostData({
					PostID: BigInt(3),
					Title: "Third Post",
					CreatedBy: {UserID: BigInt(3),Name: "Charlie"},
					PublishedAt: Timestamp.fromDate(new Date("2024-01-03T14:00:00Z")),
				})
			]
		})));
}
