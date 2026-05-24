import '@awesome.me/webawesome/dist/components/icon/icon.js';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { navigate } from '../shared/navigation.js';
import { EditPostStore} from './edit-post-store.js';
import { SignalWatcher } from '@lit-labs/signals';

import './image-list-view.js';
import './edit-post-view.js';

@customElement('edit-post-page')
export class EditPostPage extends SignalWatcher(LitElement) {

	@property({ type: String })
	id = '';

	store = new EditPostStore();

	connectedCallback() {
		super.connectedCallback();
		this.store.setup(this.id);
		this.store.load();
	}

	renderBody() {
		if (this.store.getPostFetcher.loading.get()) return html`
			<div class="empty-or-error">
				<wa-spinner style="font-size: 3rem;"></wa-spinner>
			</div>
		`;

		if (this.store.getPostFetcher.error.get()) return html`
			<div class="empty-or-error">
				<div style="padding: 16px; color: var(--wa-color-red-50);">Error: ${this.store.getPostFetcher.error.get()}</div>
			</div>
		`;

		return html`
			<div class="content">
				<edit-post-view .store=${this.store}></edit-post-view>
				<image-list-view .store=${this.store}></image-list-view>
			</div>
		`;
	}

	render() {
		return html`
			<div class="header">
				<wa-button appearance="plain" variant="neutral" size="small" pill @click=${() => navigate('/home/posts')}>
					<wa-icon name="arrow-left"></wa-icon>
				</wa-button>
				<div style="width: 8px;"></div>
				<div class="title">Edit Post</div>
				<div style="flex: 1;"></div>
				<!-- <button class="back-home" @click=${() => navigate('/home/posts')}>
					<wa-icon name="arrow-left"></wa-icon>
					<span>Back to home page</span>
				</button> -->
			</div>
			${this.renderBody()}
		`;
	}

	static override styles = css`
	:host {
		display: flex;
		height: 100vh;
		overflow: hidden;
		background-color: var(--wa-color-gray-95);
		flex-direction: column;
	}

	.empty-or-error {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: sans-serif;
		margin-left: 8px;
		border-radius: var(--wa-border-radius-l) 0 0 var(--wa-border-radius-l);
		background-color: white;
		margin-bottom: 8px;
		border-top: 1px solid var(--wa-color-gray-90);
		border-bottom: 1px solid var(--wa-color-gray-90);
		border-left: 1px solid var(--wa-color-gray-90);
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
		font-size: 20px;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: row;
		margin-bottom: 8px;
		margin-left: 8px;
		/* background-color: var(--wa-color-red-60); */
	}
	`;
}
