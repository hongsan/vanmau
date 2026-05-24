import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SignalWatcher } from '@lit-labs/signals';
import { DeptDetailStore } from './dept-detail-store';

@customElement('dept-detail-view')
export class DeptDetailView extends SignalWatcher(LitElement) {
	
	@property({ attribute: false })
	deptId: bigint = 0n;	

	store=new DeptDetailStore();

	willUpdate(changedProperties: Map<string, unknown>) {
		if (changedProperties.has('deptId') && this.store) {
			this.store.setup(this.deptId);
			this.store.getDept();
		}
	}

	render() {
		if (this.store.getDeptFetcher.loading.get()) return html`
			<div class="empty-or-error">
				<wa-spinner style="font-size: 3rem;"></wa-spinner>
			</div>
		`;
		
		if (this.store.getDeptFetcher.error.get()) return html`
			<div class="empty-or-error">
				<div style="padding: 16px; color: var(--wa-color-red-50);">Error: ${this.store.getDeptFetcher.error.get()}</div>
			</div>
		`;

		return html`
			<div class="panel-header">
				<h3>${this.store.dept.get().Name}</h3>
			</div>
			<div class="panel-body">
				<div class="section-header">
					<div class="section-title">General</div>
					<div style="flex: 1;"></div>
					<div class="section-text-action">Edit</div>
				</div>
				<div class="section-body"></div>

				<div class="section-header">
					<div class="section-title">Body</div>
					<div style="flex: 1;"></div>
					<div class="section-text-action">Preview</div>
					<div class="section-text-action">Delete</div>
				</div>
				<div class="section-body"></div>

				<div class="section-header">
					<div class="section-title">Others</div>
					<div style="flex: 1;"></div>
					<div class="section-text-action">Add</div>
				</div>
				<div class="section-body"></div>
				<div style="height: 16px;"></div>
				</div>
			</div>
		`;
	}

	static override styles = css`
		:host {
			display: flex;
			flex-direction: column;
			width: 100%;
			border-radius: var(--wa-border-radius-l) 0 0 var(--wa-border-radius-l);
			background-color: white;
			border: 1px solid var(--wa-color-gray-90);
			overflow: hidden;
			margin-bottom: 8px;
		}

		.empty-or-error {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 100%;
		}

		.detail-column {
			display: flex;
			flex-direction: column;
			flex: 1;
			border-radius: var(--wa-border-radius-l) 0 0 var(--wa-border-radius-l);
			background-color: white;
			border: 1px solid var(--wa-color-gray-90);
			overflow: hidden;
			margin-bottom: 8px;
		}

		.panel-header {
			display: flex;
			align-items: center;
			padding: 0px 16px;
			height: 40px;
			border-bottom: 1px solid var(--wa-color-red-90);
		}

		.panel-header h3 {
			margin: 0;
			font-size: 14px;
			font-weight: bold;
			color: var(--wa-color-gray-40);
		}

		.panel-body {
			flex: 1;
			overflow-y: auto;
			padding: 0;
		}

		.list-column .panel-body {
			padding: 0;
		}

		.list-item {
			display: flex;
			align-items: center;
			padding: 0px 16px;
			height: 40px;
			border-bottom: 1px solid var(--wa-color-gray-95);
			cursor: pointer;
			transition: background-color 0.2s;
			color: var(--wa-color-gray-30);
			font-size: 14px;
		}

		.list-item:hover {
			background-color: var(--wa-color-gray-95);
		}

		.detail-description {
			margin: 0;
			padding: 16px;
			font-size: 14px;
			color: var(--wa-color-gray-30);
		}

		.detail-meta {
			margin-top: 0;
			border-top: 1px solid var(--wa-color-gray-95);
		}

		.meta-row {
			display: flex;
			justify-content: space-between;
			gap: 12px;
			align-items: center;
			padding: 0px 16px;
			height: 40px;
			border-bottom: 1px solid var(--wa-color-gray-95);
		}

		.meta-label {
			font-size: 14px;
			color: var(--wa-color-gray-40);
		}

		.meta-value {
			font-size: 14px;
			font-weight: 600;
			color: var(--wa-color-gray-30);
		}

		.section-header
		{
			display: flex;
			margin-top: 2px;
			flex-direction: row;
			align-items: center;
			padding-left:16px;
			//padding-right: 16px;
			height: 36px;
		}

		.section-title {
			font-size: 11px;
			color: var(--wa-color-gray-30);
			text-transform: uppercase;
		}

		.section-text-action {
			font-size: 13px;
			color: var(--wa-color-gray-30);
			border-radius: 6px;
			cursor: pointer;
			padding: 2px 8px;
			color: var(--wa-color-red-60);
			:hover {
				background-color: var(--wa-color-gray-90);
			}
		}

		.section-text-action:hover {
			background-color: var(--wa-color-gray-90);
		}

		.section-body{
			//margin-right: 8px;
			margin-left: 16px;
			background-color: var(--wa-color-gray-95);
			height: 200px;
			border-radius: var(--wa-border-radius-l) 0 0 var(--wa-border-radius-l);
			//border-radius: var(--wa-border-radius-l);
		}

		
	`;


}
