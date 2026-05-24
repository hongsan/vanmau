import '@awesome.me/webawesome/dist/components/icon/icon.js';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { navigate } from '../shared/navigation.js';
import { EditPostStore} from './edit-post-store.js';
import { SignalWatcher } from '@lit-labs/signals';

@customElement('image-list-view')
export class ImageListView extends SignalWatcher(LitElement) {

	@property({ type: Object })
	store: EditPostStore | null = null;

	render() {
		return html`
			<div style="padding: 16px; color: var(--wa-color-gray-50);">Image list view (not implemented)</div>
		`;
	}

	static override styles = css`
	:host {
		display: block;
		overflow: hidden;
		width: 400px;
		overflow-y: auto;
		font-family: sans-serif;
		margin-left: 8px;
		border-radius: var(--wa-border-radius-l) 0 0 var(--wa-border-radius-l);
		background-color: white;
		border-top: 1px solid var(--wa-color-gray-90);
		border-bottom: 1px solid var(--wa-color-gray-90);
		border-left: 1px solid var(--wa-color-gray-90);
	}
	`;

}
