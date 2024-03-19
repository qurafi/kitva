import { withValidation } from "./schemas.out.js";

export const actions = withValidation({
	async default(event) {
		return {
			data: event.locals.validation.body.data
		};
	}
});
