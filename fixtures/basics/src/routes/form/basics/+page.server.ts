import { withValidation } from "kitva/forms/server";
import type { Actions } from "./$types2";
import { setTimeout } from "timers/promises";
// import type { Actions } from "./$types";

export const actions: Actions = withValidation({
	async default_action(event) {
		console.log("submitted");
		await setTimeout(process.env.PLAYWRIGHT_TEST_BASE_URL ? 0 : 1150);
		return {
			success: true
		};
	},
	another_action(event) {},
	test(event) {
		//
	}
});
