import { AuthenticateContentManagerResponse } from "../dto/proto/authenticating/cm-authenticating_pb";
import { Mocking } from "../shared/mocking";

export function registerAuthenticating() {
	Mocking.register("poc/authenticating/cm/authenticate", Mocking.successFetcher(
		new AuthenticateContentManagerResponse(
			{
				Token: "mocked-access-token",
				ManagerID: BigInt(1),
				Name: "John Doe",
			}
		)));

	Mocking.register("poc/authenticating/cm/logout", Mocking.successExecutor());
}
