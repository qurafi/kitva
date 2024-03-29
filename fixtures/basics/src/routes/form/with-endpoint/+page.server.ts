import { withValidation } from "kitva/server";
import type { Actions } from "./$types2";

export const actions: Actions = withValidation({
	default(event) {
		console.log(event.locals.validation);
		return { success: true };
	}
});
