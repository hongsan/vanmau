import { LitElement, css, html } from 'lit';
import { customElement} from 'lit/decorators.js';
import { UserListStore } from './user-list-store';
import { SignalWatcher } from '@lit-labs/signals';
import { repeat } from 'lit/directives/repeat.js';
import type { AddUserDialog } from './add-user/add-user-dialog';
import './add-user/add-user-dialog';
import type { DeleteUserDialog } from './delete-user/delete-user-dialog';
import './delete-user/delete-user-dialog';

@customElement('user-list-page')
export class UserListPage extends SignalWatcher(LitElement) {
	private store = new UserListStore();

	override connectedCallback() {
		super.connectedCallback();
		this.store.listUser();
	}

	#onAddClicked() {
		const dialog = this.renderRoot.querySelector<AddUserDialog>('#add-user-dialog');
		dialog?.open();
	}

	#onDeleteClicked(userID: bigint) {
		console.log('Delete button clicked for userID:', userID);
		const dialog = this.renderRoot.querySelector<DeleteUserDialog>('#delete-user-dialog');
		dialog?.open(userID);
	}	

	renderBody() {
		if (this.store.listUserFetcher.loading.get()) return html`
			<div style="display: flex; align-items: center; justify-content: center; height: 100%;">
				<wa-spinner style="font-size: 3rem;"></wa-spinner>
			</div>
		`;

		if (this.store.listUserFetcher.success.get() && this.store.users.get().length === 0) return html`
		<div style="display: flex; align-items: center; justify-content: center; height: 100%;">
			<div style="padding: 16px; color: var(--wa-color-gray-30);">No users found.</div>
		</div>
			
		`;

		if (this.store.listUserFetcher.error.get()) return html`
			<div style="display: flex; align-items: center; justify-content: center; height: 100%;">
				<div style="padding: 16px; color: var(--wa-color-red-50);">Error loading users: ${this.store.listUserFetcher.error.get()}</div>
			</div>
		`;

		return html`
			<div class="table-header">
						<div style="flex: 1;">Name</div>
						<div style="width: 300px;">Email</div>
						<div style="width: 200px;">Added At</div>
						<div style="width: 50px;"></div>
					</div>
					<div class="table-body">
						${repeat(this.store.users.get(), user => html`
							<div class="table-row">
								<div style="flex: 1;">${user.Name}</div>
								<div style="width: 300px;">${user.Email}</div>
								<div style="width: 200px;">${user.AddedAt?.toDate().toLocaleString()}</div>
								<div style="width: 50px;">
									<wa-button variant="danger" appearance="plain" size="small" pill 
										@click=${() => this.#onDeleteClicked(user.UserID)}>
										<wa-icon name="trash" ></wa-icon>
									</wa-button>
								</div>
							</div>
						`)}
					</div>

			</div>
		`;
	}

	override render() {
		return html`
			<div class="header">
				<div class="title">Users</div>
				<div style="flex: 1;"></div>
				<wa-button variant="neutral" appearance="plain" size="small" pill @click=${this.#onAddClicked}><wa-icon name="add" ></wa-icon></wa-button>
				<!-- You can add buttons or other controls in the header as needed -->
			</div>

			<div class="content">
				${this.renderBody()}
			</div>
			<add-user-dialog id="add-user-dialog"></add-user-dialog>
			<delete-user-dialog id="delete-user-dialog"></delete-user-dialog>
		`;
	}

	static override styles = css`
	:host {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: transparent;
		//padding-bottom: 8px;
	}

	.header {
		display: flex;
		align-items: center;
		flex-direction: row;
		background-color: white;
		padding: 0px 8px 0px 16px;
		font-family: sans-serif;
		border-radius: 0 0 0 var(--wa-border-radius-l);
		margin-bottom: 8px;
		border-top: 1px solid var(--wa-color-gray-90);
		border-bottom: 1px solid var(--wa-color-gray-90);
		border-left: 1px solid var(--wa-color-gray-90);
		height: 56px;
	}

	.title {
		margin: 0;
		font-size: 20px;
		color: var(--wa-color-gray-30);
		font-weight: 400;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
		font-family: sans-serif;
		border-radius: var(--wa-border-radius-l) 0 0 var(--wa-border-radius-l);
		background-color: white;
		margin-bottom: 8px;
		border-top: 1px solid var(--wa-color-gray-90);
		border-bottom: 1px solid var(--wa-color-gray-90);
		border-left: 1px solid var(--wa-color-gray-90);
	}

	.table-header {
		display: flex;
		align-items: center;
		flex-direction: row;
		padding: 0px 16px;
		font-family: sans-serif;
		border-bottom: 1px solid var(--wa-color-red-90);
		height: 40px;
		font-weight: bold;
		font-size: 14px;
		color: var(--wa-color-gray-40);
	}

	.table-body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
	}
	.table-row {
		display: flex;
		align-items: center;
		flex-direction: row;
		padding: 0px 16px;
		font-family: sans-serif;
		border-bottom: 1px solid var(--wa-color-gray-95);
		height: 40px;
		//cursor: pointer;
		color: var(--wa-color-gray-30);
		font-size: 14px;
	}

	.table-row:hover {
		background-color: var(--wa-color-red-95);
	}
`;

}
