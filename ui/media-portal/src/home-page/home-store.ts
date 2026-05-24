import { signal } from '@lit-labs/signals';
import { createContext } from '@lit/context';
import { navigate } from '../shared/navigation';

export const homeContext = createContext<HomeStore>('home');

export class HomeStore {
	currentPage = signal(window.location.pathname || '/home/editing-page');

	showPage(page: string) {
		this.currentPage.set(page);
		navigate(page);
	}
}
