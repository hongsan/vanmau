import '@awesome.me/webawesome/dist/webawesome.js';
import { SignalWatcher } from '@lit-labs/signals';
import { consume } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { homeContext, type HomeStore } from './home-store';

@customElement('menu-item')
export class MenuItem extends SignalWatcher(LitElement) {

	@consume({ context: homeContext })
	private store?: HomeStore;

	@property()
	page = '';

	@property()
	title = '';

	@property({ type: Number })
	count = 0;

	@property({ type: String })
	icon = '';

	@property({ type: Boolean, reflect: true })
	collapsed = false;

	private isSelected(currentPath: string) {
		if (!this.page) return false;

		if (this.page === '/page') {
			return currentPath === '/page';
		}

		if (this.page.startsWith('/page/')) {
			return currentPath.startsWith('/page/') && currentPath !== '/page';
		}

		return currentPath === this.page;
	}

	render() {
		const currentPath = this.store?.currentPage.get() || window.location.pathname;
		const classes = {
			selected: this.isSelected(currentPath),
		};
		return html`
			<div class=${classMap(classes)} @click="${this.#onClick}">
				${this.icon ? html`<wa-icon name=${this.icon}></wa-icon>` : ''}
				${!this.collapsed ? html`<span class="title">${this.title}</span>` : ''}
				${!this.collapsed && this.count > 0 ? html`<span class="count">${this.count}</span>` : ''}
			</div>
		`;
	}

	#onClick() {
		this.store?.showPage(this.page);
	}

	static styles = css`
	:host {
	  margin: 0;
	}

	.count {
		margin-left: auto;
		font-size: 12px;
		line-height: 1.2;
		padding: 4px 8px;
		border-radius: 999px;
		background: #eef2ff;
		color: #1e293b;
		font-weight: 600;
	}

	div.selected .count {
		background: var(--wa-color-red-50);
		color: var(--wa-color-red-700);
	}

	div {
		cursor: pointer;
		display: flex;
		align-items: center;
		padding: 12px;
		font-size: 14px;
		line-height: 20px;
		gap: 4px;
		border-radius: 0 var(--wa-border-radius-pill) var(--wa-border-radius-pill) 0;
		color: #334155;
		transition: background 150ms ease, color 150ms ease, padding 150ms ease, box-shadow 150ms ease;
	}

	:host([collapsed]) div {
		justify-content: center;
		padding-left: 12px;
		padding-right: 12px;
	}

	.title {
		padding-left: 4px;
		font-weight: 500;
	}

	wa-icon {
		color: var(--wa-color-gray-30);
		min-width: 24px;
		min-height: 24px;
	}

	div.selected {
		background: var(--wa-color-red-80);
		color: var(--wa-color-gray-30);
		padding-left: 12px;
	}

	/* div.selected wa-icon {
		color: var(--wa-color-red-50);
	} */

	div:hover {
		background: var(--wa-color-gray-90);
	}

	div.selected:hover {
		background: var(--wa-color-red-80);
		padding-left: 12px;
	}
  `;
}
