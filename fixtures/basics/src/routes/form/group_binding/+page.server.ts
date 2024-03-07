import { withValidation } from "./$form";
import type { Actions } from "./$types2";

export const actions: Actions = withValidation({
	async default(event) {
		return {
			data: event.locals.validation.body.data
		};
	}
});
