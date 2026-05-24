import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { DeptListStore } from './dept-list-store';

import './dept-list-view';
import './dept-detail-view';
import { SignalWatcher } from '@lit-labs/signals';

@customElement('dept-list-page')
export class DeptListPage extends SignalWatcher(LitElement) {

	private store = new DeptListStore();

	connectedCallback() {
		super.connectedCallback();
		this.store.reset();
		this.store.listDept();
	}

	renderBody() {
		if (this.store.listDeptFetcher.loading.get()) return html`
			<div class="empty-or-error">
				<wa-spinner style="font-size: 3rem;"></wa-spinner>
			</div>
		`;
		
		if (this.store.listDeptFetcher.error.get()) return html`
			<div class="empty-or-error">
				<div style="padding: 16px; color: var(--wa-color-red-50);">Error: ${this.store.listDeptFetcher.error.get()}</div>
			</div>
		`;

		if (this.store.depts.get().length === 0) return html`
			<div class="empty-or-error">
				<div style="padding: 16px; color: var(--wa-color-gray-30);">No departments found.</div>
			</div>
		`;

		return html`
			<dept-list-view .store=${this.store}></dept-list-view>
			<dept-detail-view .deptId=${this.store.selected.get()?.DeptID || 0n}></dept-detail-view>
		`;
	}

	render() {
		return html`
			<div class="header">
				<h2>Departments</h2>
				<div style="flex:1;"></div>
				<div class="section-text-action">Do Something Here</div>
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
		}

		.header {
			display: flex;
			align-items: center;
			flex-direction: row;
			background-color: white;
			padding: 0px 16px 0px 16px;
			font-family: sans-serif;
			border-radius: 0 0 0 var(--wa-border-radius-l);
			margin-bottom: 8px;
			border-top: 1px solid var(--wa-color-gray-90);
			border-bottom: 1px solid var(--wa-color-gray-90);
			border-left: 1px solid var(--wa-color-gray-90);
			height: 56px;
		}

		.header h2 {
			margin: 0;
			font-size: 20px;
			color: var(--wa-color-gray-30);
			font-weight: 400;
		}

		.content {
			flex: 1;
			overflow: hidden;
			display: flex;
			gap: 8px;
			font-family: sans-serif;
		}

		.empty-or-error {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			border-radius: var(--wa-border-radius-l) 0 0 var(--wa-border-radius-l);
			background-color: white;
			border: 1px solid var(--wa-color-gray-90);
			overflow: hidden;
			margin-bottom: 8px;
		}

		.list-column {
			display: flex;
			flex-direction: column;
			width: 300px;
			border-radius: var(--wa-border-radius-l);
			background-color: white;
			border: 1px solid var(--wa-color-gray-90);
			overflow: hidden;
			margin-bottom: 8px;
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
