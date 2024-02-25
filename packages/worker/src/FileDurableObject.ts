import * as Y from 'yjs';
import { Bindings } from './Bindings';

const messageTypes = {
	update: 1,
	awareness: 2,
} as const;

function encodeMessage(type: keyof typeof messageTypes, data: Uint8Array): Uint8Array {
	const array = new Uint8Array(data.length + 1);
	array[0] = messageTypes[type];
	array.set(data, 1);
	return array;
}

function decodeMessage(data: Uint8Array): { type: keyof typeof messageTypes; data: Uint8Array } {
	const typeValue = data[0];
	for (const type of Object.keys(messageTypes) as (keyof typeof messageTypes)[]) {
		if (messageTypes[type] === typeValue) {
			return { type, data: data.subarray(1) };
		}
	}
	throw new Error('Invalid message type');
}

export class FileDurableObject {
	constructor(state: DurableObjectState, env: Bindings) {}

	readonly ydoc = new Y.Doc();

	/**
	 * The Durable Object fetch handler will be invoked when a Durable Object instance receives a
	 * 	request from a Worker via an associated stub
	 *
	 * @param request - The request submitted to a Durable Object instance from a Worker
	 * @returns The response to be sent back to the Worker
	 */
	async fetch(request: Request): Promise<Response> {
		if (request.headers.get('Upgrade') === 'websocket') {
			// websocket
			const pair = new WebSocketPair();
			await this.handleSession(pair[1]);
			return new Response(null, { status: 101, webSocket: pair[0] });
		}

		return new Response('Hello World');
	}

	private async handleSession(ws: WebSocket) {
		ws.accept();
		this.sessions.add(ws);

		{
			const update = Y.encodeStateAsUpdate(this.ydoc);
			ws.send(encodeMessage('update', update));
		}

		ws.addEventListener('close', () => {
			this.sessions.delete(ws);
		});
		ws.addEventListener('error', () => {
			this.sessions.delete(ws);
		});

		ws.addEventListener('message', (event) => {
			if (!(event.data instanceof ArrayBuffer)) {
				return;
			}
			const message = decodeMessage(new Uint8Array(event.data));

			switch (message.type) {
				case 'awareness':
					// ...
					break;
				case 'update':
					Y.applyUpdate(this.ydoc, message.data);
					break;
			}
		});

		this.ydoc.on('update', (update: Uint8Array) => {
			console.log('update', update.length);

			const message = encodeMessage('update', update);
			for (const session of this.sessions) {
				session.send(message);
			}
		});
	}

	private sessions = new Set<WebSocket>();
}
