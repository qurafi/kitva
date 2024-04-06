import type { POSTEvent, PUTEvent } from "./schemas.out";
import { json } from "kitva/server";

export const POST = async (event: POSTEvent) => {
	if (event.params.c == "11") {
		return json({
			ok: true,
			params: event.params,
			queries: event.locals.validation.queries.data,
			headers: event.locals.validation.headers.data,
			body: event.locals.validation.body.data
		});
	}
	return json(
		{
			error: "str"
		},
		{
			status: 4000
		}
	);
};

export const PUT = async (event: PUTEvent) => {
	if (event.params.c == "11") {
		return json({
			ok: true,
			params: event.params,
			body: event.locals.validation.body.data
		});
	}
	return json(
		{
			error: "str"
		},
		{
			status: 404
		}
	);
};
