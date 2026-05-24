import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import type WaDialog from '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import '@awesome.me/webawesome/dist/components/divider/divider.js';
import '@awesome.me/webawesome/dist/styles/webawesome.css';
import { SignalWatcher } from '@lit-labs/signals';
import { localized, msg } from '@lit/localize';
import { LitElement, css, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { LogoutStore } from './logout-store';

@localized()
@customElement('logout-dialog')
export class LogoutDialog extends SignalWatcher(LitElement) {
	private store = new LogoutStore();
	@query('#logout-dialog') dialog!: WaDialog;

	open() {
		this.dialog.open = true;
	}

	close() {
		this.dialog.open = false;
	}

	#onConfirm() {
		if (!this.store) return;
		this.store.logoutExecutor.error.set(null);
		this.store.logout()?.then(() => {
			this.close();
		});
	}

	render() {
		const isLoading = this.store.logoutExecutor.loading.get();
		const error = this.store.logoutExecutor.error.get();

		return html`
			<wa-dialog
				label=${msg('Log out')}
				id="logout-dialog"
				@wa-request-close=${(e: Event) => {
				if (isLoading) e.preventDefault();
			}}
			>
				<wa-divider></wa-divider>
				<div class="form-container">
					<wa-callout variant="danger" class="confirmation-text">
						<wa-icon slot="icon" name="ban" color="danger"></wa-icon>
						${msg('Are you sure you want to log out?')}
					</wa-callout>

					${error ? html`<div class="error-message">${error}</div>` : ''}

					<div class="button-group">
						<wa-button
							?disabled=${isLoading}
							appearance="outlined"
							variant="neutral"
							title="${msg('Cancel')}"
							@click=${() => this.close()}
							pill
						>
							${msg('Cancel')}
						</wa-button>
						<wa-button
							?disabled=${isLoading}
							variant="danger"
							title="${msg('Log out')}"
							@click=${() => this.#onConfirm()}
							pill
						>
							${msg('Log out')}
						</wa-button>
					</div>
				</div>
			</wa-dialog>
		`;
	}

	static styles = css`
		:host {
			display: block;
		}

		wa-dialog::part(panel) {
			border: 1px solid #fecaca;
			border-radius: 12px;
			box-shadow: 0 20px 40px rgba(153, 27, 27, 0.15);
		}

		wa-dialog::part(header), wa-dialog::part(body), wa-dialog::part(footer) {
			padding: 12px 16px;
		}

		wa-dialog .form-container {
			padding: unset;
		}

		.form-container {
			display: flex;
			flex-direction: column;
			gap: 16px;
			padding: 0 16px;
		}

		.confirmation-text {
			font-size: 12px;
			color: #991B1B;
			background-color: #FEE2E2;
		}

		.error-message {
			color: #dc2626;
			font-size: 14px;
			padding: 8px;
			background: #fee2e2;
			border-radius: 4px;
		}

		.button-group {
			display: flex;
			gap: 8px;
			justify-content: flex-end;
		}

		.button-group wa-button {
			flex: 1;
		}
	`;
}
