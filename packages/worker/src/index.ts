import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
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

	try {
		const decoded = jwt.verify(token, secret);
		if (typeof decoded !== 'object') {
			return c.text('invalid token', 403);
		}
		if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
			return c.text('token expired', 403);
		}
		if (decoded.file_id !== fileID) {
			return c.text('invalid token', 403);
		}
	} catch (e) {
		return c.text('invalid token', 403);
	}

	const id = c.env.FILE_DURABLE_OBJECT.idFromName(fileID);
	const obj = c.env.FILE_DURABLE_OBJECT.get(id);

	return await obj.fetch(c.req.raw);
});

export default app;
