import { ControlMessage, PushEvent } from "../dto/proto/authenticating/websocket_pb";

class WsConnection {
	// Public event emitter
	events = new EventTarget();
	connected: boolean = false;
	retrying: boolean = false;
	socket?: WebSocket;

	// last init params for reconnect
	url: string = "";

	// Heartbeat
	pingInterval = 5000; // Send ping every 5s
	pongTimeout = 5000;   // Wait 5s for response
	pingTimer: number | undefined = undefined;
	pongTimer: number | undefined = undefined;

	// Reconnect/backoff
	reconnectAttempts: number = 0;
	reconnectTimer: number | undefined = undefined;
	reconnectInitialDelay = 1000;
	reconnectMaxDelay = 30000;

	startHeartbeat() {
		this.pingTimer = setInterval(() => {
			var msg = new ControlMessage({ Type: 'ping' });
			const bin = msg.toBinary();
			this.socket?.send(new Uint8Array(bin));

			// Start a countdown. If this finishes before a pong arrives, the connection is dead.
			this.pongTimer = window.setTimeout(() => {
				console.warn("Heartbeat lost. Closing connection...");
				this.socket?.close();
				this.events.dispatchEvent(new CustomEvent('status', { detail: { connected: false, retrying: true, attempt: this.reconnectAttempts + 1 } }));
			}, this.pongTimeout);

		}, this.pingInterval);
	}

	heartbeatReceived() {
		clearTimeout(this.pongTimer);
	}

	stopHeartbeat() {
		clearInterval(this.pingTimer);
		clearTimeout(this.pongTimer);
	}

	private scheduleReconnect() {
		if (this.reconnectTimer) return; // already scheduled

		this.retrying = true;
		const delay = Math.min(this.reconnectInitialDelay * 2 ** this.reconnectAttempts, this.reconnectMaxDelay);
		this.events.dispatchEvent(new CustomEvent('status', { detail: { connected: false, retrying: true, attempt: this.reconnectAttempts + 1, nextDelay: delay } }));

		this.reconnectTimer = window.setTimeout(() => {
			this.reconnectTimer = undefined;
			this.reconnectAttempts++;
			this.init(this.url);
			// if(this.url) {
			// 	this.socket = new WebSocket(this.url);
			// }
		}, delay);
	}

	init(baseUrl: string) {
		// Skip if already connecting or connected
		if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
			return;
		}

		var wsUrl = baseUrl.replace('https', 'wss').replace('http', 'ws') + "/ws?role=channel-manager";
		this.url = baseUrl;

		// Close existing socket if any
		if (this.socket) {
			this.socket.close();
		}

		// set initial state
		this.connected = false;
		this.events.dispatchEvent(new CustomEvent('status', { detail: { connected: false } }));
		this.socket = new WebSocket(wsUrl);

		const socket = this.socket;

		socket.binaryType = "arraybuffer";

		socket.onopen = () => {
			console.log("WebSocket connection established");
			// reset reconnect state
			this.retrying = false;
			this.reconnectAttempts = 0;
			if (this.reconnectTimer) {
				clearTimeout(this.reconnectTimer);
				this.reconnectTimer = undefined;
			}

			this.startHeartbeat();
			this.events.dispatchEvent(new Event('open'));
			this.events.dispatchEvent(new CustomEvent('status', { detail: { connected: true, retrying: false } }));
		};

		socket.onmessage = (event) => {
			if (event.data instanceof ArrayBuffer) {
				const bytes = new Uint8Array(event.data);
				try {
					const msg = PushEvent.fromBinary(bytes);
					if (msg.Channel === 'pong') {
						this.heartbeatReceived();
						return;
					}

					const updateEvent = new CustomEvent(msg.Channel, { detail: msg.Data });
					this.events.dispatchEvent(updateEvent);
				} catch (e) {
					console.error("Failed to decode PushEvent:", e);
				}
			}
		};

		this.socket.onclose = () => {
			console.log("WebSocket connection closed");
			this.stopHeartbeat();
			this.events.dispatchEvent(new CustomEvent('status', { detail: { connected: false, retrying: true, attempt: this.reconnectAttempts + 1 } }));
			this.scheduleReconnect();
		};

		this.socket.onerror = (err) => {
			console.error('WebSocket error', err);
		};
	}
}

export const wsConnection = new WsConnection();
