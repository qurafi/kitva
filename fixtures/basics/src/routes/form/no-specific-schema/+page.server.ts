import { withValidation } from "./schemas.out";

export const actions = withValidation({
	another() {
		return { success: true };
	},
	validated() {
		return { success: "validated" };
	}
});
