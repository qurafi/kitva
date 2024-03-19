import { json } from "@sveltejs/kit";
import { handleValidate } from "kitva/server";
import type { POSTHandler } from "./schemas.out";

export const POST: POSTHandler = async (event) => {
	const result = {
		your_input: event.locals.validation.body.input
	};
	// console.log({ result });
	return json(result);
};

//TODO fix typing
handleValidate(POST, async ({ input, validate, event }) => {
	if (event.url.searchParams.has("novalidate")) {
		return false;
	}

	if (input.body) {
		input.body.filled_by_server = "filled by server";
	}

	await validate();

	delete input.body.password;
});
