import { Message } from "@bufbuild/protobuf";
import { Error as ScynaError } from "../dto/proto/error_pb";
import { Session } from "./session";
import { signal } from "@lit-labs/signals";

export class Executor {
	loading = signal(false);
	success = signal(false);
	error = signal<string | null>(null);
	code: string | null = null;
	url: string;

	constructor(url: string) {
		this.url = url;
	}

	reset() {
		this.loading.set(false);
		this.success.set(false);
		this.error.set(null);
		this.code = null;
	}

	async execute(request: Message) {
		this.loading.set(true);
		this.error.set(null);
		this.code = null;
		this.success.set(false);

		return new Promise<void>((resolve, reject) => {
			Session.execute(this.url, request)
				.then((res) => {
					console.log("Executor", res);
					this.loading.set(false);
					this.success.set(true);
					resolve();
				})
				.catch((err: ScynaError) => {
					console.log("Executor", err);
					this.loading.set(false);
					this.error.set(err.Message);
					this.code = err.Code;
					reject(err);
				});
		});
	}
}
