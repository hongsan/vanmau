import { signal } from '@lit-labs/signals';
import { createContext } from '@lit/context';
import { navigate } from '../shared/navigation';

export const homeContext = createContext<HomeStore>('home');

export class HomeStore {
	currentPage = signal(window.location.pathname || '/home/signal-page');

	constructor() {
		//for back button
		window.addEventListener("popstate", () => {
			this.currentPage.set(window.location.pathname);
		});
	}

	showPage(page: string) {
		this.currentPage.set(page);
		navigate(page);
	}

	load() {
		// In real app, this might fetch user-specific navigation items from server
	}
}
