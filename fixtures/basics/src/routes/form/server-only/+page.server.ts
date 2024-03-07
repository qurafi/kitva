import { withValidation } from "./$form";
import type { Actions } from "./$types";

export const actions: Actions = withValidation({
	another() {
		return { success: true };
	},
	validated() {
		return { success: "validated" };
	}
});
