import { Fetcher } from "../shared/fetcher";
import { signal } from "@lit-labs/signals";
import { Session } from "../shared/session";
import { ListUserRequest, ListUserResponse, type ListUserResponse_UserData } from "../dto/proto/simple-list/list-user_pb";

export class UserListStore {
    listUserFetcher = new Fetcher('base/user/list-user');
    users = signal<Array<ListUserResponse_UserData>>([]);

    constructor() {
        Session.events.addEventListener('user-added', () => {this.listUser();});
    }

	listUser() {
		if (this.listUserFetcher.loading.get()) return;

		this.listUserFetcher.execute(
            new ListUserRequest({}),
            new ListUserResponse(),
		).then((response) => {
            this.users.set(response.Users);
        });
	}
}