import { withValidation } from "./schemas.out";

export const actions = withValidation({
	default(event) {
		console.log(event.locals.validation);
		return { success: true };
	}
});
