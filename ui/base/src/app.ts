import '@awesome.me/webawesome/dist/styles/themes/default.css';
import '@awesome.me/webawesome/dist/styles/webawesome.css';
import { Router, Routes } from '@lit-labs/router';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import './home-page/home-page.js';
import './login-page/login-page.js';
import { navigate } from './shared/navigation.js';
import { Session } from './shared/session.js';
import { SignalWatcher } from '@lit-labs/signals';

@customElement('base-app')
export class BaseApp extends SignalWatcher(LitElement) {
	private checkLogin = async () => {
		if (!Session.isInitialized) {
			await Session.init();
		}

		if (!Session.isLoggedIn) {
			navigate('/login', { replace: true });
			return false;
		}
		return true;
	}

	private router = new Router(
		this,
		[
			{
				path: '/login',
				enter: async () => {
					await Session.reset();
					return true;
				},
				render: () => html`<login-page></login-page>`,
			},
			{
				path: '/home/*',
				enter: this.checkLogin,
				render: () => html`<home-page></home-page>`,
			},
			{
				path: '/home',
				enter: this.checkLogin,
				render: () => {
					location.replace(`/home/users`);
					return null;
				}
			},
			{
				path: '/',
				render: () => {
					location.replace(`/login`);
					return null;
				}
			},
		]
	);

	render() {
		return this.router.outlet();
	}

	static styles = css`
		:root {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
			line-height: 1.5;
			font-weight: 400;
			color: #1f2937;
			background-color: #f8fafc;
		}

		* {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
		}

		html,
		body {
			width: 100%;
			min-height: 100%;
		}

		body {
			background: #f8fafc;
		}

		a {
			color: inherit;
			text-decoration: none;
		}`;
}
