import '@awesome.me/webawesome/dist/components/icon/icon.js';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { EditPostStore} from './edit-post-store.js';
import { SignalWatcher } from '@lit-labs/signals';

@customElement('edit-post-view')
export class EditPostView extends SignalWatcher(LitElement) {

	@property({ type: Object })
	store: EditPostStore| null = null;

	connectedCallback() {
		super.connectedCallback();
		this.store?.setup(this.id);
		this.store?.load();
	}

	render() {
		return html`
		<div style="padding: 16px; color: var(--wa-color-gray-50);">Edit post view (not implemented)</div>
		`;
	}

	static override styles = css`
	:host {
		display: block;
		overflow: hidden;
		flex: 1;
		overflow-y: auto;
		font-family: sans-serif;
		border-radius: var(--wa-border-radius-l);
		background-color: white;
		border-top: 1px solid var(--wa-color-gray-90);
		border-bottom: 1px solid var(--wa-color-gray-90);
		border-left: 1px solid var(--wa-color-gray-90);
	}

	.page-shell {
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		background-color: var(--wa-color-gray-95);
	}

	.back-home {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px;
		border: none;
		background: transparent;
		font-size: 13px;
		font-weight: 600;
		color: #334155;
		cursor: pointer;
		border-radius: var(--wa-border-radius-l);
		transition: background 150ms ease, color 150ms ease;
	}

	.back-home:hover {
		background: var(--wa-color-gray-90);
		color: #0f172a;
	}

	.main {
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
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
		margin-left: 8px;
	}

	.title {
		margin: 0;
		font-size: 20px;
		color: var(--wa-color-gray-30);
		font-weight: 400;
	}

	.content {
		flex: 1;
		padding: 24px;
		font-family: sans-serif;
		margin-left: 8px;
		border-radius: var(--wa-border-radius-l) 0 0 var(--wa-border-radius-l);
		background-color: white;
		margin-bottom: 8px;
		border-top: 1px solid var(--wa-color-gray-90);
		border-bottom: 1px solid var(--wa-color-gray-90);
		border-left: 1px solid var(--wa-color-gray-90);
	}

	.demo-id {
		font-weight: 700;
		color: #0f172a;
	}

	`;

}
