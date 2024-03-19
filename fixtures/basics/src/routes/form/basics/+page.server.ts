import { setTimeout } from "timers/promises";
import { withValidation } from "./schemas.out.js";

export const actions = withValidation({
	async default_action(event) {
		const data = event.locals.validation.body.data;
		data.accept_tos;

		await setTimeout(process.env.PLAYWRIGHT_TEST_BASE_URL ? 0 : 1150);
		return {
			success: true
		};
	},
	another_action(event) {
		return {
			foo: 2
		};
		//
	},

	//@ts-expect-error does not have schema
	async test(event) {
		return {
			bar: "str"
		};
	}
});

// export type FormResult<Name extends string = string, Data = AnyMap> = {
// 	action: Name;
// 	input: Record<keyof Data, any>;
// 	errors: Record<keyof Data, AjvError>;
// };

// type FormResults<T extends Actions> = {
// 	[k in keyof T]: T[k] extends (...args: any) => any
// 		? (
// 				event: Parameters<T[k]>[0]
// 		  ) => Awaited<ReturnType<T[k]>> &
// 				FormResult<k & string, k extends keyof ActionSchemas ? ActionSchemas[k] : AnyMap>
// 		: never;
// };
