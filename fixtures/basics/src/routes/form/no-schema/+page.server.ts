import { withValidation } from "kitva";
import type { Actions } from "./$types";

export const actions: Actions = withValidation({
	default() {
		return { success: true };
	}
});
