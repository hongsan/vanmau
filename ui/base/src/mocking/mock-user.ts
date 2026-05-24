import { Timestamp } from "@bufbuild/protobuf";
import { Mocking } from "../shared/mocking";
import { ListUserResponse, ListUserResponse_UserData } from "../dto/proto/simple-list/list-user_pb";

export function registerUserMocking() {

	Mocking.register("base/user/list-user", Mocking.successFetcher(
		new ListUserResponse({
			Users: [
				new ListUserResponse_UserData({
					UserID: BigInt(1),
					Name: "First User",
					Email: "first.user@example.com",
					AddedAt: Timestamp.fromDate(new Date("2024-01-01T10:00:00Z")),
				}),
				new ListUserResponse_UserData({
					UserID: BigInt(2),
					Name: "Second User",
					Email: "second.user@example.com",
					AddedAt: Timestamp.fromDate(new Date("2024-01-02T12:00:00Z")),
				}),
				new ListUserResponse_UserData({
					UserID: BigInt(3),
					Name: "Third User",
					Email: "third.user@example.com",
					AddedAt: Timestamp.fromDate(new Date("2024-01-03T14:00:00Z")),
				})
			]
		})));

		Mocking.register("base/user/add-user", Mocking.successExecutor(2000));
		//Mocking.register("base/user/add-user", Mocking.failEndpoint("Error", "Failed to add user", 2000));

}
