import { signal } from '@lit-labs/signals';
import { Executor } from '../../shared/executor';
import type WaDrawer from '@awesome.me/webawesome/dist/components/drawer/drawer.js';
import { Session } from '../../shared/session';
import { AddUserRequest } from '../../dto/proto/simple-list-page/add-user_pb';

export class AddUserStore {
	addUserExecutor = new Executor('base/user/add-user');
	email = signal<string>('');
	name = signal<string>('');
	password = signal<string>('');

	setup() {
		this.email.set('');
		this.name.set('');
		this.password.set('');
		this.addUserExecutor.reset();
	}

	addUser(drawer: WaDrawer) {
		if (this.addUserExecutor.loading.get()) return;

		this.addUserExecutor.execute(
			new AddUserRequest({
				Email: this.email.get(),
				Name: this.name.get(),
				Password: this.password.get(),
			}),
		).then(() => {
			Session.events.dispatchEvent(new CustomEvent('user-added'));
			drawer.open = false;
		});
	}
}
