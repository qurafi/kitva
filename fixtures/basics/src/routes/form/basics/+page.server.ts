import { setTimeout } from "timers/promises";
import { withValidation } from "./$form";

export const actions = withValidation({
	async default_action(event) {
		const data = event.locals.validation.body.data;

		await setTimeout(process.env.PLAYWRIGHT_TEST_BASE_URL ? 0 : 1150);
		return {
			success: true
		};
	},
	another_action(event) {
		//
	},
	test(event) {
		//
	}
});
