import { Hono } from 'hono';
import { Bindings } from './Bindings';
export { FileDurableObject } from './FileDurableObject';

const app = new Hono<{
	Bindings: Bindings;
}>();

// GET /file?id=123
app.get('/file', async (c) => {
	console.log('get /file');

	const fileID = c.req.queries('id');
	if (fileID?.length !== 1) {
		return c.text('id is required', 404);
	}

	const id = c.env.FILE_DURABLE_OBJECT.idFromName(fileID[0]);
	const obj = c.env.FILE_DURABLE_OBJECT.get(id);
	return await obj.fetch(c.req.raw);
});

export default app;
