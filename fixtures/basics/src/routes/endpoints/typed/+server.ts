import { json } from "kitva/server";
import type { GETEvent, POSTEvent } from "./schemas.out";

export const POST = async (event: POSTEvent) => {
	return json({ ok: true });
};

export const GET = async (event: GETEvent) => {
	return json({ header: event.locals.validation.headers.data.a });
};
