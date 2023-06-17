import { withValidation } from "kitva/forms/server";
import type { Actions } from "./$types";

export const actions: Actions = withValidation({
	another() {
		return { success: true };
	},
	validated() {
		return { success: "validated" };
	}
});
