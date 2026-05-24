import { LogoutContentManagerRequest } from '../dto/proto/authenticating/cm-authenticating_pb';
import { Executor } from '../shared/executor';
import { navigateReplace } from '../shared/navigation';
import { Session } from '../shared/session';

export class LogoutStore {
	logoutExecutor = new Executor('poc/authenticating/content-manager/logout');

	logout() {
		if (this.logoutExecutor.loading.get()) return;

		return this.logoutExecutor.execute(
			new LogoutContentManagerRequest({})
		).then(async () => {
			await Session.clearSession();
			Session.token = null;
			Session.isLoggedIn = false;
			Session.userID = BigInt(0);
			Session.name.set('');
			Session.email = '';
			navigateReplace('/login');
		});
	}
}
