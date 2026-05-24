import { LitElement, css, html } from 'lit';
import { customElement} from 'lit/decorators.js';
import { PostListStore } from './post-list-store';
import { SignalWatcher } from '@lit-labs/signals';
import { repeat } from 'lit/directives/repeat.js';

@customElement('post-list-page')
export class PostListPage extends SignalWatcher(LitElement) {
	private store = new PostListStore();

	override connectedCallback() {
		super.connectedCallback();
		this.store.listPost();
	}

	renderBody() {
		if (this.store.listPostFetcher.loading.get()) return html`
			<div style="display: flex; align-items: center; justify-content: center; height: 100%;">
				<wa-spinner style="font-size: 3rem;"></wa-spinner>
			</div>
		`;

		if (this.store.listPostFetcher.success.get() && this.store.posts.get().length === 0) return html`
		<div style="display: flex; align-items: center; justify-content: center; height: 100%;">
			<div style="padding: 16px; color: var(--wa-color-gray-30);">No posts found.</div>
		</div>
			
		`;

		if (this.store.listPostFetcher.error.get()) return html`
			<div style="display: flex; align-items: center; justify-content: center; height: 100%;">
				<div style="padding: 16px; color: var(--wa-color-red-50);">Error loading posts: ${this.store.listPostFetcher.error.get()}</div>
			</div>
		`;

		return html`
			<div class="table-header">
						<div style="flex: 1;">Title</div>
						<div style="width: 300px;">Created By</div>
						<div style="width: 200px;">Published At</div>
					</div>
					<div class="table-body">
						${repeat(this.store.posts.get(), post => html`
							<div class="table-row">
								<div style="flex: 1;">${post.Title}</div>
								<div style="width: 300px;">${post.CreatedBy?.Name}</div>
								<div style="width: 200px;">${post.PublishedAt?.toDate().toLocaleString()}</div>
							</div>
						`)}
					</div>

			</div>
		`;
	}

	override render() {
		return html`
			<div class="header">
				<div class="title">Posts</div>
				<div style="flex: 1;"></div>
				<!-- You can add buttons or other controls in the header as needed -->
			</div>

			<div class="content">
				${this.renderBody()}
			</div>
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
		background-color: var(--wa-color-gray-95);
	}
`;

}
