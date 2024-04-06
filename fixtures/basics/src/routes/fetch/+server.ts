import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { api } from "kitva";

export const GET: RequestHandler = async ({ fetch, url }) => {
	const q = Object.fromEntries(url.searchParams);
	console.log({ q });
	const result = await api(fetch, q.url as any, JSON.parse(q.data));
	return json({
		status: result.status,
		data: await result.json()
	});
};
