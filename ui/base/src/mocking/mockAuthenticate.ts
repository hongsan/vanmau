import { AuthenticateUserResponse } from "../dto/proto/authenticating/authenticate_pb";
import { Mocking } from "../shared/mocking";

export function registerAuthenticate() {
	Mocking.register("base/authenticating/user/authenticate", Mocking.successFetcher(
		new AuthenticateUserResponse(
			{
				Token: "mocked-access-token",
				UserID: BigInt(1),
				Name: "John Doe",
			}
		)));

	Mocking.register("base/authenticating/user/logout", Mocking.successExecutor());
}
