import '@awesome.me/webawesome/dist/components/avatar/avatar.js';
import '@awesome.me/webawesome/dist/components/divider/divider.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import { SignalWatcher } from '@lit-labs/signals';
import { localized, msg } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { Session } from '../shared/session';
import './logout-dialog';
import type { LogoutDialog } from './logout-dialog';
import './menu-item';

@localized()
@customElement('side-bar')
export class SideBar extends SignalWatcher(LitElement) {

	@state()
	private collapsed = false;

	@query('#logout-dialog')
	private logoutDialog!: LogoutDialog;

	toggleCollapsed() {
		this.collapsed = !this.collapsed;
	}

	toggleSettings() {
		this.openLogoutDialog();
	}

	openLogoutDialog() {
		this.logoutDialog?.open();
	}

	render() {
		const displayName = Session.name.get() || msg('Unknown User');

		return html`
		<nav class=${this.collapsed ? 'collapsed' : ''}>
			<div class="sidebar-card ${this.collapsed ? 'collapsed' : ''}">
				<div class="sidebar-header">
					<div class="logo-block">
						<div class="logo-text">
							<div class="logo-name">Media Portal</div>
							<div class="logo-sub">Portal to manage media content</div>
						</div>
					</div>
					<button class="collapse-button" @click=${this.toggleCollapsed}>
            			<wa-icon name=${this.collapsed ? 'angles-right' : 'angles-left'}></wa-icon>
					</button>
				</div>
				<div class="menu-list">
					<div class="section-title">${msg('Posts')}</div>
					<menu-item .collapsed=${this.collapsed} page="/home/editing-page" title=${msg('Editing')} icon="diagram-project"></menu-item>
					<menu-item .collapsed=${this.collapsed} page="/home/single-empty" title=${msg('Published')} icon="clock-rotate-left"></menu-item>
          <div class="section-title">${msg('Others')}</div>
					<menu-item .collapsed=${this.collapsed} page="/home/two-column" title=${msg('Two Columns Page')} icon="bell"></menu-item>
					<menu-item .collapsed=${this.collapsed} page="/home/three-column" title=${msg('Three Columns Page')} icon="list"></menu-item>
				</div>
				<div class="sidebar-footer">
           <div class="user-section">
             <div class="user-panel">
               <wa-avatar initials=${displayName.charAt(0).toUpperCase()}></wa-avatar>
               <div class="user-name">${displayName}</div>
             </div>
             <button class="settings-button" title=${msg('Settings')} @click=${this.toggleSettings}>
               <wa-icon name="gear"></wa-icon>
             </button>
           </div>
				</div>
			</div>
      <logout-dialog id="logout-dialog"></logout-dialog>
		</nav>
    `;
	}

	static styles = css`
    nav {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 241px;
      background: transparent;
      padding: 0;
      box-sizing: border-box;
    }

    nav.collapsed {
      width: 56px;
    }

    .sidebar-card {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 100%;
    }

    .sidebar-card.collapsed {
      width: 56px;
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 16px 0px 16px 16px;
    }

    .logo-block {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-mark {
      width: 40px;
      height: 40px;
      border-radius: 14px;
      background: linear-gradient(135deg, #D13A38 0%, #8C2332 100%);
      position: relative;
    }

    .logo-mark::before {
      content: '';
      position: absolute;
      top: 8px;
      right: 8px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #FFF200;
      box-shadow: 0 0 0 4px rgba(255, 242, 0, 0.15);
    }

    .logo-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .logo-name {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logo-sub {
      font-size: 12px;
      color: #64748B;
      line-height: 1.2;
    }

    .collapse-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #334155;
      padding: 6px;
      cursor: pointer;
      border-radius: 8px;
      transition: background 150ms ease, color 150ms ease, border-color 150ms ease;
    }

    .collapse-button:hover {
      background: #eff6ff;
      color: #1d4ed8;
      border-color: #bfdbfe;
    }

    .menu-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .section-title {
      padding: 0 16px;
      margin: 0;
      color: var(--wa-color-gray-60);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .sidebar-footer {
      margin-top: auto;
      padding: 12px 0px 8px 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .user-panel {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px;
      border-radius: var(--wa-border-radius-l);
      background: var(--wa-color-blue-80);
      flex: 1;
      min-width: 0;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-panel wa-avatar {
      width: 24px;
      height: 24px;
      font-size: 10px;
      flex-shrink: 0;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      min-width: 0;
      flex: 1;
    }

    .settings-button,
    .logout-button {
      border: none;
      border-radius: var(--wa-border-radius-l);
      padding: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: background 150ms ease, color 150ms ease;
    }

    .settings-button {
      width: 32px;
      height: 32px;
      padding: 0;
      border-radius: var(--wa-border-radius-l);
      color: #334155;
      flex-shrink: 0;
    }

    .settings-button:hover {
      color: #0f172a;
	  background: var(--wa-color-gray-90);
    }

    .logout-button {
      background: var(--wa-color-red-80);
      color: var(--wa-color-red-100);
      justify-content: flex-start;
    }

    .logout-button:hover {
      background: var(--wa-color-red-70);
      color: #7f1d1d;
    }

    .section-title--with-action {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 8px;
    }

    .quick-create-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: #64748B;
      padding: 2px 4px;
      cursor: pointer;
      border-radius: 4px;
      transition: background 150ms ease, color 150ms ease;
      line-height: 1;
    }

    .quick-create-button:hover {
      background: var(--wa-color-gray-90);
      color: #0F172A;
    }

    nav.collapsed .section-title {
      display: none;
    }

    nav.collapsed .sidebar-footer {
      padding: 12px 0px 8px 8px;
      align-items: center;
    }

    nav.collapsed .user-panel {
      background: transparent;
      padding: 0;
      justify-content: center;
    }

    nav.collapsed .user-panel wa-avatar {
      width: 42px;
      height: 42px;
      font-size: 12px;
    }

    nav.collapsed .user-section {
      justify-content: center;
    }

    nav.collapsed .user-name {
      display: none;
    }

    nav.collapsed .settings-button {
      display: none;
      width: 24px;
      height: 24px;
      padding: 0;
      border-radius: 50%;
      background: #e2e8f0;
      position: static;
    }

    nav.collapsed .logo-text,
    nav.collapsed .sidebar-header {
      justify-content: center;
	  padding: 16px 0px 16px 0px;
    }

    nav.collapsed .logo-name,
    nav.collapsed .logo-sub {
      display: none;
    }

    nav.collapsed .menu-list {

	}
    nav.collapsed .logo-mark {
      margin: 0 auto;
    }

    .menu-list::-webkit-scrollbar {
      display: none;
    }
  `;
}
