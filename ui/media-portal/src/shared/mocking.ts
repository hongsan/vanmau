
import { Message } from "@bufbuild/protobuf";
import { Error as ScynaError } from "../dto/proto/error_pb";

export type Endpoint = <Response extends Message>(request: Message) => Promise<Response>;

class MockingStatic {
	private endpoints = new Map<string, Endpoint>();

	register(url: string, endpoint: Endpoint) {
		this.endpoints.set(url, endpoint);
	}

	find(url: string): Endpoint | null {
		return this.endpoints.get(url) || null;
	}

	failEndpoint(code: string, message: string, duration: number = 1000): Endpoint {
		return (_: Message): Promise<any> => {
			return new Promise((_, reject) => {
				setTimeout(() => {
					reject(new ScynaError({
						Code: code,
						Message: message
					}));
				}, duration);
			});
		};
	}

	successFetcher<Response extends Message>(response: Response, duration: number = 1000): Endpoint {
		return (_: Message): Promise<any> => {
			return new Promise((resolve, _) => {
				setTimeout(() => {
					resolve(response);
				}, duration);
			});
		};
	}

	successExecutor(duration: number = 1000): Endpoint {
		return (_: Message): Promise<any> => {
			return new Promise((resolve, _) => {
				setTimeout(() => {
					resolve(new ScynaError({
						Code: "OK",
						Message: "Success"
					}));
				}, duration);
			});
		};
	}
}

export const Mocking = new MockingStatic();
