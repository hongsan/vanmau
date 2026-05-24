import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/card/card.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import { Routes } from '@lit-labs/router';
import { provide } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { navigate } from '../shared/navigation.js';
import { homeContext, HomeStore } from './home-store.js';
import './sidebar.js';

import '../simple-list/user-list-page.js';
import '../pagination-list/post-list-page.js';

@customElement('home-page')
export class HomePage extends LitElement {
	@provide({ context: homeContext })
	private store = new HomeStore();
	private routes = new Routes(this,
		[
			{
				path: '',
				render: () => {
					navigate('/home/users', { replace: true });
					return null;
				}
			},
			{
				path: 'users',
				render: () => html`<user-list-page></user-list-page>`,
			},
			{
				path: 'posts',
				render: () => html`<post-list-page></post-list-page>`,
			},

		]
	);

	override render() {
		void this.store;

		return html`
			<div class="home-shell">
				<side-bar></side-bar>
				<main class="content-area">
					${this.routes.outlet()}
				</main>
			</div>
		`;
	}

	static styles = css`
		:host {
			display: block;
			height: 100dvh;
			overflow: hidden;
		}

		.home-shell {
			height: 100dvh;
			display: grid;
			grid-template-columns: auto minmax(0, 1fr);
			gap: 8px;
			overflow: hidden;
			background-color: var(--wa-color-gray-95);
		}

		app-sidebar {
			position: sticky;
			top: 0;
			height: 100dvh;
			align-self: start;
		}

		.content-area {
			display: block;
			min-width: 0;
			min-height: 0;
			overflow: hidden;
		}

		.content-card {
			height: 100%;
			padding: 16px;
			overflow: hidden;
			min-height: 0;
		}

		@media (max-width: 900px) {
			.home-shell {
				grid-template-columns: 1fr;
				padding: 16px;
			}

			app-sidebar {
				position: static;
				height: auto;
			}

			.hero {
				flex-direction: column;
				align-items: stretch;
			}
		}
	`;
}
