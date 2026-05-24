import { Mocking } from "../shared/mocking";
import { ListDeptResponse, ListDeptResponse_DeptData } from "../dto/proto/list-and-detail/list-dept_pb";

export function registerDeptMocking() {

	//Mocking.register("base/post/list-post", Mocking.failEndpoint("ListPostError","Fail to list posts"));
	//Mocking.register("base/post/list-post", Mocking.successFetcher(new ListPostResponse()));
	Mocking.register("base/dept/list-dept", Mocking.successFetcher(
		new ListDeptResponse({
			Depts: [
				new ListDeptResponse_DeptData({
					DeptID: BigInt(1),
					Name: "First Department",
				}),
				new ListDeptResponse_DeptData({
					DeptID: BigInt(2),
					Name: "Second Department",
				}),
				new ListDeptResponse_DeptData({
					DeptID: BigInt(3),
					Name: "Third Department",
				})
			],
		}))
	);
}
