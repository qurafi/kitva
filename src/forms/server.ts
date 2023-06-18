import { type Actions, fail } from "@sveltejs/kit";
import type { AnyMap, AnyError } from "../types.js";

export function withValidation<T extends Record<string, any>>(t: T) {
	const out: Actions = {};
	for (const [name, action] of Object.entries(t)) {
		out[name] = (event) => {
			const { validation } = event.locals;
			if (!validation) {
				return action(event);
			}

			// currently we only handle body validation
			if (!validation.valid && validation.body?.input) {
				return fail(400, {
					[`__form_${name}`]: {
						input: validation.body.input,
						errors: validation.formErrors
					}
				});
			}
			return action(event);
		};
	}
	return out as WithValidation<T>;
}

type WithValidation<T extends Record<string, any>> = T & FormResult<T>;

type FormResult<T> = {
	/** @deprecated */
	__hacky_ts_prop_to_inject_form_errors_on_action_data: () => {
		[k in `__form_${keyof T & string}`]: {
			input: AnyMap;
			errors: Record<string, AnyError>;
		};
	};
};
