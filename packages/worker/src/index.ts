import { Hono } from 'hono';
import { verify } from 'hono/jwt';
import { Bindings } from './Bindings';
export { FileDurableObject } from './FileDurableObject';

const app = new Hono<{
	Bindings: Bindings;
}>();

// GET /file?id=123&token=abc
app.get('/file', async (c) => {
	console.log('get /file');

	const fileIDs = c.req.queries('id');
	if (fileIDs?.length !== 1) {
		return c.text('id is required', 404);
	}
	const fileID = fileIDs[0];

	const tokens = c.req.queries('token');
	if (tokens?.length !== 1) {
		return c.text('token is required', 404);
	}

	const token = tokens[0];
	const secret = c.env.CF_WORKER_JWT_SECRET;

	console.log(token.length, secret.length);

	try {
		const payload = await verify(token, secret);
		if (!('file_id' in payload) || payload.file_id !== fileID) {
			return c.text('file id mismatch', 403);
		}
	} catch (e) {
		return c.text('invalid token ' + String(e), 403);
	}

	const id = c.env.FILE_DURABLE_OBJECT.idFromName(fileID);
	const obj = c.env.FILE_DURABLE_OBJECT.get(id);

	return await obj.fetch(c.req.raw);
});

export default app;
