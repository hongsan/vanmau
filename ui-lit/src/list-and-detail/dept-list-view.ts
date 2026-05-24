import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { DeptListStore } from './dept-list-store';
import { repeat } from 'lit/directives/repeat.js';
import { SignalWatcher } from '@lit-labs/signals';

@customElement('dept-list-view')
export class DeptListView extends SignalWatcher(LitElement) {

	@property({ type: Object })	store: DeptListStore | null = null;

	render() {
		return html`
			<div class="panel-header">
				<h3>Departments</h3>
				<div style="flex: 1;"></div>
				<wa-button variant="neutral" appearance="plain" size="small" pill @click=${() => {}}>
					<wa-icon name="magnifying-glass"></wa-icon>
				</wa-button>

				<wa-button variant="neutral" appearance="plain" size="small" pill @click=${() => {}}>
					<wa-icon name="add"></wa-icon>
				</wa-button>
				<!-- <wa-button variant="neutral" appearance="plain" size="small" pill @click=${() => this.store?.listDept()}>
					<wa-icon name="refresh"></wa-icon>
				</wa-button> -->
			</div>
			<div class="panel-body">
				${this.renderList()}
			</div>
		`;
	}

	renderList() {
		return html`
			${repeat(this.store?.depts.get() || [], dept => html`
				<div class="list-item ${this.store?.selected.get() === dept ? ' selected' : ''}"
				@click=${() => this.store?.selected.set(dept)}>${dept.Name}</div>
			`)}
		`;
	}
	static override styles = css`
		:host {
			display: flex;
			flex-direction: column;
			width: 400px;
			border-radius: var(--wa-border-radius-l);
			background-color: white;
			border: 1px solid var(--wa-color-gray-90);
			overflow: hidden;
			margin-bottom: 8px;
		}

		.panel-header {
			display: flex;
			align-items: center;
			padding: 4px 4px 4px 16px;
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
			cursor: pointer;
		}

		.selected {
			background-color: var(--wa-color-red-95);
		}


		.list-item:hover {
			background-color: var(--wa-color-gray-95);
		}
	`;


}
