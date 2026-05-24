import { Executor } from '../../shared/executor';
import type WaDrawer from '@awesome.me/webawesome/dist/components/drawer/drawer.js';
import { Session } from '../../shared/session';
import { DeleteUserRequest } from '../../dto/proto/simple-list/delete-user_pb';

export class DeleteUserStore {
	deleteUserExecutor = new Executor('base/user/delete-user');
	userID: bigint= 0n;

	setup(userID: bigint) {
		this.userID = userID;
		this.deleteUserExecutor.reset();
	}

	deleteUser(drawer: WaDrawer) {
		if (this.deleteUserExecutor.loading.get()) return;

		this.deleteUserExecutor.execute(
			new DeleteUserRequest({UserID: this.userID}),
		).then(() => {
			Session.events.dispatchEvent(new CustomEvent('user-deleted', { detail: { userID: this.userID } }));
			drawer.open = false;
		});
	}
}
