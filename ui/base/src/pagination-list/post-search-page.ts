import { LitElement, css, html } from 'lit';
import { customElement, property, query} from 'lit/decorators.js';
import { PostListStore } from './post-list-store';
import { SignalWatcher } from '@lit-labs/signals';

@customElement('post-search-page')
export class PostSearchPage extends SignalWatcher(LitElement) {
	@query('#search-input') searchInput!: HTMLInputElement;

	@property({ type: Object })
	store = new PostListStore();

	#onSearchInput(e: Event) {
		const query = (e.target as HTMLInputElement).value;
		if (query === '') this.store.endSearch();
		else this.store.searchPosts(query);
	}

	renderBody() {
		if (this.store.searchPostFetcher.loading.get()) return html`
			<div style="display: flex; align-items: center; justify-content: center; height: 100%;">
				<wa-spinner style="font-size: 3rem;"></wa-spinner>
			</div>
		`;

		if (this.store.searchPostFetcher.success.get() && (!this.store.founds.get() || this.store.founds.get()!.length === 0)) return html`
		<div style="display: flex; align-items: center; justify-content: center; height: 100%;">
			<div style="padding: 16px; color: var(--wa-color-gray-30);">No posts found.</div>
		</div>
		`;

		if (this.store.searchPostFetcher.error.get()) return html`
			<div style="display: flex; align-items: center; justify-content: center; height: 100%;">
				<div style="padding: 16px; color: var(--wa-color-red-50);">Error loading posts: ${this.store.searchPostFetcher.error.get()}</div>
			</div>
		`;

		if (this.store.founds.get() === null) return html`
			<div style="display: flex; align-items: center; justify-content: center; height: 100%;">
				<div style="padding: 16px; color: var(--wa-color-gray-30);">Please enter a search query.</div>
			</div>
		`;

		return html`
			<div class="table-header">
						<div style="flex: 1;">Title</div>
						<div style="width: 300px;">Created By</div>
						<div style="width: 200px;">Published At</div>
					</div>
					<div class="table-body">
						${this.store.founds.get() ? this.store.founds.get()!.map(post => html`
							<div class="table-row">
								<div style="flex: 1;">${post.Title}</div>
								<div style="width: 300px;">${post.CreatedBy?.Name}</div>
								<div style="width: 200px;">${post.PublishedAt?.toDate().toLocaleString()}</div>
							</div>
						`) : ''}
					</div>

			</div>
		`;
	}

	override render() {
		return html`
			<div class="header">
				<wa-icon name="magnifying-glass" style="margin-right: 4px;"></wa-icon>
				<input id="search-input" placeholder="Search posts..." .value=${''} style="flex: 1; border: none; outline: none; font-size: 18px;"
					@input=${this.#onSearchInput} autofocus>
				<wa-button appearance="plain" size="small" @click=${() => {this.store.endSearch()}} pill>
					<wa-icon name="close" style="margin-right: 4px;"></wa-icon>
				</wa-button>
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

	.pagination {
		display: flex;
		align-items: center;
		flex-direction: row;
		font-family: sans-serif;
		color: var(--wa-color-gray-30);
		font-size: 16px;
		gap: 4px;
	}
`;

}
