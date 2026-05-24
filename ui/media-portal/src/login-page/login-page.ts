import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/card/card.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/select/select.js';
import { SignalWatcher } from '@lit-labs/signals';
import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { LoginStore } from './login-store.js';

@customElement('login-page')
export class LoginPage extends SignalWatcher(LitElement) {
	private _store = new LoginStore();

	private _onUsernameInput(e: Event) {
		const input = e.target as { value?: string | null };
		this._store.email = input.value ?? '';
	}

	private _onPasswordInput(e: Event) {
		const input = e.target as { value?: string | null };
		this._store.password = input.value ?? '';
	}

	private _onLanguageChange(e: Event) {
		const select = e.target as { value?: string | null };
		const value = select.value ?? 'en';
		if (value === 'en' || value === 'vi') {
			this._store.setLanguage(value);
		}
	}

	override render() {
		const loading = this._store.loading.get();
		const error = this._store.error.get();

		return html`
			<div class="login-shell">
				<wa-card class="login-card">
					<h2 class="title">Login</h2>
					<div class="form-fields">
						<wa-input
							type="email"
							placeholder="Email"
							.value="${this._store.email}"
							@input="${this._onUsernameInput}"
							?disabled="${loading}"
						></wa-input>
						<wa-input
							type="password"
							placeholder="Password"
							password-toggle
							.value="${this._store.password}"
							@input="${this._onPasswordInput}"
							?disabled="${loading}"
						></wa-input>
						<div class="language-row">
							<wa-select
								label="Language"
								value="${this._store.language.get()}"
								@change="${this._onLanguageChange}"
								?disabled="${loading}"
							>
								<wa-option value="en">English</wa-option>
								<wa-option value="vi">Tiếng Việt</wa-option>
							</wa-select>
						</div>
						${error ? html`<div class="error-message">${error}</div>` : null}
					</div>
					<wa-button
						class="submit-button"
						size="medium"
						?disabled="${loading}"
						?loading="${loading}"
						@click="${() => this._store.login()}"
					>
						${loading ? 'Logging in...' : 'Login'}
					</wa-button>
				</wa-card>
			</div>
		`;
	}

	static styles = css`
		:host {
			display: block;
		}

		.login-shell {
			min-height: calc(100dvh - 32px);
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.login-card {
			width: min(420px, 100%);
			padding: 24px;
		}

		.title {
			margin: 0 0 16px;
			text-align: center;
			font-size: 1.25rem;
			font-weight: 700;
		}

		.form-fields {
			display: flex;
			flex-direction: column;
			gap: 12px;
			margin-bottom: 16px;
		}

		.language-row {
			width: 100%;
		}

		.error-message {
			color: var(--wa-color-danger-fill-loud, #b91c1c);
			font-size: 0.875rem;
		}

		.submit-button {
			width: 100%;
		}
	`;
}
