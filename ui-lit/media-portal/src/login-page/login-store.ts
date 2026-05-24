import { signal } from "@lit-labs/signals";
import { Error as ScynaError } from "../dto/proto/error_pb";
import { navigate } from "../shared/navigation";
import { Session } from "../shared/session";
import { AuthenticateContentManagerRequest, AuthenticateContentManagerResponse } from "../dto/proto/authenticating/cm-authenticating_pb";

export class LoginStore {
	email: string = "";
	password: string = "";
	loading = signal(false);
	error = signal<string | null>(null);
	language = signal<string>("en");

	constructor() {
		// default credentials only for local/dev runs
		const host = window.location.hostname.toLowerCase();
		if (host === 'localhost' || host === '127.0.0.1' || host.includes('dev')) {
			this.email = "alice@gmail.com";
			this.password = "123456";
		}
	}

	setLanguage(lang: string) {
		this.language.set(lang);
		localStorage.setItem('language', lang);
	}

	login() {
		this.loading.set(true);
		this.error.set(null);

		return Session.fetch("poc/authenticating/cm/authenticate",
			new AuthenticateContentManagerRequest({
				Email: this.email,
				Password: this.password,
			}),
			new AuthenticateContentManagerResponse()
		).then((response) => {
			Session.setup(
				this.email,
				response.Token,
				response.ManagerID,
				response.Name,
			);
			navigate('/home/editing-page');
		}).catch((e: ScynaError) => {
			this.error.set(e.Message);
		}).finally(() => {
			this.loading.set(false);
		});
	}
}
