import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/divider/divider.js';
import '@awesome.me/webawesome/dist/components/drawer/drawer.js';
import type WaDrawer from '@awesome.me/webawesome/dist/components/drawer/drawer.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import { LitElement, css, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { DeleteUserStore as DeleteUserStore } from './delete-user-store';
import { SignalWatcher } from '@lit-labs/signals';

@customElement('delete-user-dialog')
export class DeleteUserDialog extends  SignalWatcher(LitElement) {
	@query('#delete-user-drawer') drawer!: WaDrawer;
	private store = new DeleteUserStore();

	open(userID: bigint) {
		this.store.setup(userID);
		this.drawer.open = true;
	}

	#onConfirmClicked() {
		this.store.deleteUser(this.drawer);
	}

	override render() {
		return html`
			<wa-drawer label="Delete User" id="delete-user-drawer" size="medium">
				<wa-divider style="--spacing: 0.6rem;"></wa-divider>
				<div class="body">

					<div class="warning">Do you really want to delete this user?</div>
					${this.store.deleteUserExecutor.error.get() ? html`<div class="error">${this.store.deleteUserExecutor.error.get()}</div>` : ''}

					<div class="actions">
						<wa-button 
							appearance="accent" variant="danger" @click=${this.#onConfirmClicked} 
							?disabled=${this.store.deleteUserExecutor.loading.get()} pill
							?loading=${this.store.deleteUserExecutor.loading.get()}>Delete
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

		.warning {
			padding: 10px 12px;
			border-radius: 8px;
			background: var(--wa-color-yellow-90);
			color: var(--wa-color-yellow-10);
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
