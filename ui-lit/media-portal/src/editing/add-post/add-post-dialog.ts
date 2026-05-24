import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/divider/divider.js';
import '@awesome.me/webawesome/dist/components/drawer/drawer.js';
import type WaDrawer from '@awesome.me/webawesome/dist/components/drawer/drawer.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import { LitElement, css, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { AddPostStore as AddPostStore } from './add-post-store';
import { SignalWatcher } from '@lit-labs/signals';

@customElement('add-post-dialog')
export class AddPostDialog extends  SignalWatcher(LitElement) {
	@query('#add-post-drawer') drawer!: WaDrawer;
	private store = new AddPostStore();

	open() {
		console.log('Add Post button clicked');
		this.store.setup();
		this.drawer.open = true;
	}

	#onTitleChanged(e: Event) {
		this.store.title.set((e.target as HTMLInputElement).value);
	}

	#onSaveClicked() {
		this.store.addPost(this.drawer);
	}

	override render() {
		return html`
			<wa-drawer label="Add Post" id="add-post-drawer" size="medium">
				<wa-divider style="--spacing: 0.6rem;"></wa-divider>
				<div class="body">
					<label class="label">Title</label>
					<wa-input placeholder="Enter post title" .value=${this.store.title.get()} @input=${this.#onTitleChanged}></wa-input>

					${this.store.addPostExecutor.error.get() ? html`<div class="error">${this.store.addPostExecutor.error.get()}</div>` : ''}

					<div class="actions">
						<wa-button 
							appearance="accent" variant="danger" @click=${this.#onSaveClicked} 
							?disabled=${this.store.addPostExecutor.loading.get()} pill>
							${this.store.addPostExecutor.loading.get() ? 'Adding' : 'Add'}
						</wa-button>
					</div>
				</div>
			</wa-drawer>
		`;
	}

	static override styles = css`
		:host {
			display: block;
		}

		wa-drawer::part(dialog) {
			border-top-left-radius: var(--wa-border-radius-l);
			border-bottom-left-radius: var(--wa-border-radius-l);
		}

		wa-drawer::part(body) {
			padding: 0px;
		}
		wa-drawer::part(header) {
			padding-left: 16px;
		}

		.body {
			display: flex;
			flex-direction: column;
			gap: 12px;
			padding: 4px 16px 4px 16px;
		}

		.label {
			font-size: 12px;
			font-weight: 700;
			text-transform: uppercase;
			color: #6b7280;
		}

		.error {
			padding: 10px 12px;
			border-radius: 8px;
			background: #fee2e2;
			color: #991b1b;
			font-size: 14px;
		}

		.success {
			padding: 10px 12px;
			border-radius: 8px;
			background: #ecfdf5;
			color: #065f46;
			font-size: 14px;
		}

		.actions {
			display: flex;
			padding-top: 8px;
			gap: 8px;
		}

		.actions wa-button {
			flex: 1;
		}
	`;
}
