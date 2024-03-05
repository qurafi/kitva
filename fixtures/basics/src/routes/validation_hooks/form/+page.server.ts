import type { Actions } from "./$types2";
import { formFailure, handleValidate, withValidation } from "kitva/server";
export const actions: Actions = withValidation({
	default(event) {
		const { data } = event.locals.validation.body;
		if (data) {
			if (data.password == "123456") {
				return formFailure(event, {
					password: "password should not be 123456"
				});
			}

			if (data.username === "admin" && data.password !== "secret") {
				return formFailure(event, "username or password is invalid");
			}
		}

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
