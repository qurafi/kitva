import type { Actions } from "./$types2";
import { handleValidate, withValidation } from "kitva/server";
export const actions: Actions = withValidation({
	default(event) {
		return { success: true, input: event.locals.validation.body.input };
	}
});

handleValidate(actions.default, async ({ event, input, validate }) => {
	if (event.url.searchParams.has("novalidate")) {
		return false;
	}

	if (input.body) {
		input.body.filled_by_server = "filled by server";
	}

	await validate();

	delete input.body.password;
});
