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

// From y-leveldb
const PREFERRED_TRIM_SIZE = 500;

export class FileDurableObject {
	constructor(state: DurableObjectState, env: Bindings) {
		this.state = state;
		this.env = env;
	}

	readonly state: DurableObjectState;
	readonly env: Bindings;

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
		const update = await this.loadUpdates();

		ws.accept();
		this.sessions.add(ws);
		ws.send(encodeMessage('update', update));

		ws.addEventListener('close', () => {
			this.sessions.delete(ws);
		});
		ws.addEventListener('error', () => {
			this.sessions.delete(ws);
		});

		ws.addEventListener('message', async (event) => {
			if (!(event.data instanceof ArrayBuffer)) {
				return;
			}
			const message = decodeMessage(new Uint8Array(event.data));

			switch (message.type) {
				case 'awareness':
					for (const session of this.sessions) {
						if (session !== ws) {
							session.send(event.data);
						}
					}
					break;
				case 'update':
					for (const session of this.sessions) {
						if (session !== ws) {
							session.send(event.data);
						}
					}
					await this.storeUpdate(message.data);
					break;
			}
		});
	}

	private async storeUpdate(update: Uint8Array) {
		await this.state.storage.transaction(async (txn) => {
			let count = ((await txn.get('count')) || 0) as number;

			if (count < PREFERRED_TRIM_SIZE) {
				await txn.put('update-' + count, update);
				await txn.put('count', count + 1);
			} else {
				const updates: Uint8Array[] = [];
				for (let i = 0; i < count; i++) {
					const update = await txn.get('update-' + i);
					if (update instanceof Uint8Array) {
						updates.push(update);
					}
				}

				const update = Y.mergeUpdates(updates);

				await txn.put('update-0', update);
				await txn.put('count', 1);
			}
		});
	}

	private async loadUpdates() {
		return await this.state.storage.transaction(async (txn) => {
			let count = ((await txn.get('count')) || 0) as number;

			const updates: Uint8Array[] = [];
			for (let i = 0; i < count; i++) {
				const update = await txn.get('update-' + i);
				if (update instanceof Uint8Array) {
					updates.push(update);
				}
			}

			return Y.mergeUpdates(updates);
		});
	}

	private sessions = new Set<WebSocket>();
}