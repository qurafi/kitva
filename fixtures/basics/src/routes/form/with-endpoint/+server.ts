import { text } from "@sveltejs/kit";
import type { POSTHandler } from "./schemas.out";

export const POST: POSTHandler = async (event) => {
	// data is fully typed
	const { data } = event.locals.validation.body;
	return text("ok");
};
