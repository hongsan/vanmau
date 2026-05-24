import { Message, protoInt64 } from '@bufbuild/protobuf';
import { signal } from '@lit-labs/signals';
import axios, { AxiosError } from 'axios';
import { Error as ScynaError } from '../dto/proto/error_pb';
import { registerAuthenticate } from '../mocking/mock-authenticate';
import { Mocking } from './mocking';
import { registerUserMocking } from '../mocking/mock-user';
import { registerPostMocking } from '../mocking/mock-post';

type FetchFunction = <Response extends Message<Response>>(
	api: string,
	request: Message,
	response: Response,
) => Promise<Response>;

type ExecuteFunction = (api: string, request: Message) => Promise<void>;

function registerMocking() {
	registerAuthenticate();
	registerUserMocking();
	registerPostMocking();
}
const DEFAULT_BASE_URL = (import.meta.env.VITE_BASE_URL ?? '').toString().trim();
const ROLE = 'user';

class SessionStore {
	baseUrl: string = DEFAULT_BASE_URL;
	events = new EventTarget(); /* for emiting events */
	userID = protoInt64.zero;
	name = signal('');
	email = '';
	token: string | null = null;
	isLoggedIn: boolean = false;
	isInitialized: boolean = false;

	fetch: FetchFunction = this.fetchFromServer;
	execute: ExecuteFunction = this.executeFromServer;

	constructor() {
		if (this.baseUrl == 'mocking') {
			this.fetch = this.fetchFromMocking;
			this.execute = this.executeFromMocking;
			registerMocking();
		}
	}

	async reset() {
		await this.clearSession();
		this.isInitialized = true;
	}

	async init() {
		var session = await this.loadSession();
		if (session) {
			/*TODO: jwt work here to validate expiration*/
			this.token = session.sessionId;
			this.email = session.email;
			this.userID = BigInt(session.userId);
			this.name.set(session.name);
			this.isLoggedIn = true;

			// if (this.baseUrl != 'mocking')
			// 	wsConnection.init(this.baseUrl);
		} else {
			await this.clearSession();
		}
		this.isInitialized = true;
	}

	setup(email: string, token: string, userID: bigint, name: string) {
		this.token = token;
		this.userID = userID;
		this.name.set(name);
		this.email = email;
		this.isLoggedIn = true;

		// if (this.baseUrl != 'mocking')
		// 	wsConnection.init(this.baseUrl);

		this.saveSession(token, email, userID.toString(), name).catch(error => {
			console.error('Error saving session:', error);
		});
	}

	async loadSession() {
		try {
			const jsonValue = localStorage.getItem('v-social-session');
			return jsonValue != null ? JSON.parse(jsonValue) : null;
		} catch (e) {
			console.error('Error loading session', e);
			return null;
		}
	}

	async saveSession(sessionId: string, email: string,userId: string,name: string	) { 
		try {
			const session = {
				sessionId,
				email,
				userId,
				name: name,
			};
			localStorage.setItem('v-social-session', JSON.stringify(session));
			console.log('Session saved');
		} catch (e) {
			console.error('Error saving session', e);
		}
	}

	async clearSession() {
		try {
			localStorage.removeItem('v-social-session');
			console.log('Session cleared');
		} catch (e) {
			console.error('Error clearing session', e);
		}
	}

	async fetchFromServer<Response extends Message<Response>>(
		api: string,
		request: Message,
		response: Response,
	): Promise<Response> {
		return new Promise<Response>((resolve, reject) => {
			axios.post(`${this.baseUrl}/${api}`, request.toBinary(), {
				headers: {
					'Role': ROLE,
					'Content-Type': 'application/protobuf',
					...(this.baseUrl.endsWith('vinsmartfuture.tech')
						&& this.token ? { 'SessionID': this.token } : {}),
				},
				responseType: 'arraybuffer',
				withCredentials: true,
			}).then(httpResponse => {
				if (httpResponse.status === 200) {
					try {
						const buf = new Uint8Array(httpResponse.data);
						response.fromBinary(buf);
						resolve(response);
					} catch (err) {
						/* FIXME: won't get here */
						reject(
							new ScynaError({
								Code: 'ParseError',
								Message: 'Error parsing response',
							}),
						);
					}
				} else {
					console.error(`Receive Http status code: ${httpResponse.status}`);
					reject(
						new ScynaError({
							Code: 'HttpError',
							Message: `Receive Http status code: ${httpResponse.status}`,
						}),
					);
				}
			}).catch((error: AxiosError) => {
				if (error.status === 400) {
					const buf = new Uint8Array(error.response?.data as ArrayBuffer);
					reject(ScynaError.fromBinary(buf));
				} else if (error.status === 401 || error.status === 403) {
					this.isLoggedIn = false;
					this.token = null;
					this.userID = protoInt64.zero;
					this.clearSession();
					reject(
						new ScynaError({
							Code: 'Unauthorized',
							Message: 'Unauthorized',
						}),
					);
				} else {
					reject(
						new ScynaError({
							Code: 'HttpError',
							Message: `Receive Http status code: ${error.status}`,
						}),
					);
				}
			});
		});
	}

	async executeFromServer(api: string, request: Message) {
		return new Promise<void>((resolve, reject) => {
			axios.post(`${this.baseUrl}/${api}`, request.toBinary(), {
				headers: {
					'Role': ROLE,
					'Content-Type': 'application/protobuf',
					...(this.baseUrl.endsWith('vinsmartfuture.tech') && this.token ? { 'SessionID': this.token } : {}),
				},
				responseType: 'arraybuffer',
				withCredentials: true,
			}).then(httpResponse => {
				if (httpResponse.status === 200) {
					resolve();
				} else {
					console.error(`Receive Http status code: ${httpResponse.status}`);
					reject(
						new ScynaError({
							Code: 'HttpError',
							Message: `Receive Http status code: ${httpResponse.status}`,
						}),
					);
				}
			}).catch((error: AxiosError) => {
				if (error.status === 400) {
					const buf = new Uint8Array(error.response?.data as ArrayBuffer);
					reject(ScynaError.fromBinary(buf));
				} else if (error.status === 401 || error.status === 403) {
					this.isLoggedIn = false;
					this.token = null;
					this.userID = protoInt64.zero;
					this.clearSession();
					reject(
						new ScynaError({
							Code: 'Unauthorized',
							Message: 'Unauthorized',
						}),
					);
				} else {
					reject(
						new ScynaError({
							Code: 'HttpError',
							Message: `Receive Http status code: ${error.status}`,
						}),
					);
				}
			});
		});
	}

	async fetchFromMocking<Response extends Message<Response>>(
		api: string,
		request: Message,
		_: Response,
	): Promise<Response> {
		return new Promise<Response>((resolve, reject) => {
			var endpoint = Mocking.find(api);
			if (endpoint) {
				endpoint(request)
					.then(responseData => {
						resolve(responseData as Response);
					})
					.catch(error => {
						reject(error);
					});
			} else {
				reject(
					new ScynaError({
						Code: 'EndpointNotFound',
						Message: `No implementation for this endpoint: ${api}`,
					}),
				);
			}
		});
	}

	async executeFromMocking(api: string, request: Message) {
		return new Promise<void>((resolve, reject) => {
			var endpoint = Mocking.find(api);
			if (endpoint) {
				endpoint(request).then(() => {
					resolve();
				}).catch(error => {
					reject(error);
				});
			} else {
				reject(
					new ScynaError({
						Code: 'EndpointNotFound',
						Message: `No implementation for this endpoint: ${api}`,
					}),
				);
			}
		});
	}
}

export const Session = new SessionStore();
