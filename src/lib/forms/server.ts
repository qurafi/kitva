import { type Actions, fail, ActionFailure } from "@sveltejs/kit";
import type {
	AnyMap,
	AnyError,
	AnyRequestEvent,
	EventWithValidation,
	ValidationParts
} from "../types.js";
import { getActionName } from "$lib/utils/svelte.js";
import { objectMap } from "$lib/utils/index.js";
import type { AjvError } from "$lib/index.js";

type WithValidation<T extends Record<string, any>> = T & FormResults<T>;

export function withValidation<T extends Record<string, any>>(t: T) {
	const out: Actions = {};
	for (const [name, action] of Object.entries(t)) {
		out[name] = (event) => {
			const { validation } = event.locals;

			if (validation && !validation.valid && validation.body?.valid === false) {
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

type ExtractFields<T> = T extends EventWithValidation<ValidationParts<{ body: infer R }, any, any>>
	? R
	: never;

type ErrorOfFields<T> = Partial<Record<keyof ExtractFields<T> | "$$error", string>>;

export function formFailure<T extends AnyRequestEvent = AnyRequestEvent>(
	event: T,
	status: number,
	errors: ErrorOfFields<T> | string
): ActionFailure<any> {
	const action = getActionName(event.url.search);

	if (typeof errors == "string") {
		errors = {
			$$error: errors
		} as ErrorOfFields<T>;
	}

	return fail(status, {
		[`__form_${action}`]: {
			input: event.locals.validation?.body?.input,
			errors: objectMap(errors, (value, prop) => {
				return {
					instancePath: prop == "$$error" ? "" : `/${prop}`,
					schemaPath:
						prop == "$$error" ? "#/errorMessage" : `#/properties/${prop}/errorMessage`,
					keyword: "errorMessage",
					params: {
						errors: [],
						form_failure: true
					},
					message: value
				} satisfies AjvError;
			})
		}
	});
}

type FormResults<T> = {
	/** @deprecated */
	__hacky_ts_prop_to_inject_form_errors_on_action_data: () => {
		[k in `__form_${keyof T & string}`]: {
			input: AnyMap;
			errors: Record<string, AnyError>;
		};
	};
};
