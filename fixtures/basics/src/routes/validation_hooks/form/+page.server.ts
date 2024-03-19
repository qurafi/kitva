import { formFailure, handleValidate } from "kitva/server";
import { withValidation } from "./schemas.out";

export const actions = withValidation({
	default: (event) => {
		const { data } = event.locals.validation.body;
		if (data) {
			//TODO test passing formFailure with extra data
			if (data.password == "123456") {
				return formFailure(event, {
					errors: {
						password: "password should not be 123456"
					}
				});
			}

			if (data.username === "admin" && data.password !== "secret") {
				return formFailure(event, "username or password is invalid");
			}
		}

		return { success: true, input2: event.locals.validation.body.input };
	}
});

handleValidate(actions.default, async ({ event, input, validate }) => {
	event.locals.validation;
	if (event.url.searchParams.has("novalidate")) {
		return false;
	}

	if (input.body) {
		input.body.filled_by_server = "filled by server";
	}

	await validate();

	delete input.body.password;
});
