import { signal } from '@lit-labs/signals';
import { Executor } from '../../shared/executor';
import type WaDrawer from '@awesome.me/webawesome/dist/components/drawer/drawer.js';
import { AddPostRequest } from '../../dto/proto/editing/creating-commands_pb';
import { Session } from '../../shared/session';

export class AddPostStore {
	addPostExecutor = new Executor('poc/editing/cm/add-post');
	title = signal<string>('');

	setup() {
		this.title.set('');
		this.addPostExecutor.reset();
	}

	addPost(drawer: WaDrawer) {
		if (this.addPostExecutor.loading.get()) return;

		this.addPostExecutor.execute(
			new AddPostRequest({ Title: this.title.get()}),
		).then(() => {
			Session.events.dispatchEvent(new CustomEvent('post-added'));
			drawer.open = false;
		});
	}
}
