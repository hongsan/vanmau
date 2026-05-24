import { Message } from "@bufbuild/protobuf";
import { Error as ScynaError } from "../dto/proto/error_pb";
import { Session } from "./session";
import { signal } from "@lit-labs/signals";

export class Fetcher {
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

	async execute<Response extends Message<Response>>
		(request: Message, response: Response): Promise<Response> {

		this.loading.set(true);
		this.error.set(null);
		this.code = null;
		this.success.set(false);

		return new Promise<Response>((resolve, reject) => {
			Session.fetch(this.url, request, response)
				.then((res) => {
					this.loading.set(false);
					this.success.set(true);
					resolve(res);
				})
				.catch((err: ScynaError) => {
					this.loading.set(false);
					this.error.set(err.Message);
					this.code = err.Code;
					reject(err);
				});
		});
	}
}
