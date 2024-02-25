import * as Y from 'yjs';
import { Bindings } from './Bindings';

const messageTypes = {
	update: 1,
	awareness: 2,
} as const;

export class FileDurableObject {
	constructor(state: DurableObjectState, env: Bindings) {}

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

		const ydoc = new Y.Doc();

		ws.addEventListener('close', () => {
			this.sessions.delete(ws);
		});
		ws.addEventListener('error', () => {
			this.sessions.delete(ws);
		});

		ws.addEventListener('message', (event) => {
			const data = event.data;
			if (!(data instanceof ArrayBuffer)) {
				return;
			}

			const array = new Uint8Array(data);
			switch (array[0]) {
				case messageTypes.awareness:
					// ...
					break;
				case messageTypes.update:
					Y.applyUpdate(ydoc, array.subarray(1));
					break;
			}
		});

		ydoc.on('update', (update: Uint8Array) => {
			const array = new Uint8Array(update.length + 1);
			array[0] = messageTypes.update;
			array.set(update, 1);

			for (const session of this.sessions) {
				session.send(array);
			}
		});
	}

	private sessions = new Set<WebSocket>();
}
