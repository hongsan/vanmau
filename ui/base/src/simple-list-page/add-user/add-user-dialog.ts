import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/divider/divider.js';
import '@awesome.me/webawesome/dist/components/drawer/drawer.js';
import type WaDrawer from '@awesome.me/webawesome/dist/components/drawer/drawer.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import { LitElement, css, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { AddUserStore as AddUserStore } from './add-user-store';
import { SignalWatcher } from '@lit-labs/signals';

@customElement('add-user-dialog')
export class AddUserDialog extends  SignalWatcher(LitElement) {
	@query('#add-user-drawer') drawer!: WaDrawer;
	private store = new AddUserStore();

	open() {
		console.log('Add User button clicked');
		this.store.setup();
		this.drawer.open = true;
	}

	#onEmailChanged(e: Event) {
		this.store.email.set((e.target as HTMLInputElement).value);
	}

	#onNameChanged(e: Event) {
		this.store.name.set((e.target as HTMLInputElement).value);
	}

	#onPasswordChanged(e: Event) {
		this.store.password.set((e.target as HTMLInputElement).value);
	}

	#onSaveClicked() {
		this.store.addUser(this.drawer);
	}

	override render() {
		return html`
			<wa-drawer label="Add User" id="add-user-drawer" size="medium">
				<wa-divider style="--spacing: 0.6rem;"></wa-divider>
				<div class="body">
					<label class="label">Email</label>
					<wa-input placeholder="Enter email" .value=${this.store.email.get()} @input=${this.#onEmailChanged}></wa-input>
					<label class="label">Name</label>
					<wa-input placeholder="Enter name" .value=${this.store.name.get()} @input=${this.#onNameChanged}></wa-input>
					<label class="label">Password</label>
					<wa-input type="password" placeholder="Enter password" .value=${this.store.password.get()} @input=${this.#onPasswordChanged}></wa-input>

					${this.store.addUserExecutor.error.get() ? html`<div class="error">${this.store.addUserExecutor.error.get()}</div>` : ''}

					<div class="actions">
						<wa-button 
							appearance="accent" variant="danger" @click=${this.#onSaveClicked} 
							?disabled=${this.store.addUserExecutor.loading.get()} pill
							?loading=${this.store.addUserExecutor.loading.get()}>Add
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
