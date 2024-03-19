import type { Actions } from "./$types";

export const actions: Actions = {
	another() {
		return { success: true };
	},
	validated() {
		return { success: "validated" };
	}
};
