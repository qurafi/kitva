import { localize } from "$lib/ajv/localization.js";
import { objectMap } from "$lib/utils/index.js";
import { getActionName } from "$lib/utils/svelte.js";
import { type ActionFailure, fail, type Actions } from "@sveltejs/kit";
import type {
	AnyError,
	AnyMap,
	AnyRequestEvent,
	EventWithValidation,
	ValidationParts
} from "../types.js";
import { GLOBAL_ERROR } from "$lib/ajv/index.js";

type TGLOBAL_ERROR = typeof GLOBAL_ERROR;

type WithValidation<T extends Record<string, any>> = T & FormResults<T>;

export function withValidation<T extends Record<string, any>>(t: T) {
	const out: Actions = {};
	for (const [name, action] of Object.entries(t)) {
		out[name] = async (event) => {
			const { validation } = event.locals;

			if (validation && !validation.valid && validation.body?.valid === false) {
				await localize(event, validation.body.errors);
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

type ErrorOfFields<T> = Partial<Record<keyof ExtractFields<T> | TGLOBAL_ERROR, string>>;

export async function formFailure<T extends AnyRequestEvent = AnyRequestEvent>(
	event: T,
	status: number,
	errors: ErrorOfFields<T> | string
): Promise<ActionFailure<any>> {
	const action = getActionName(event.url.search);

	if (typeof errors == "string") {
		errors = {
			[GLOBAL_ERROR]: errors
		} as ErrorOfFields<T>;
	}

	const error_map = objectMap(errors, (value, prop) => {
		return errorObject(prop, value);
	});

	await localize(event, Object.values(error_map));

	return fail(status, {
		[`__form_${action}`]: {
			input: event.locals.validation?.body?.input,
			errors: error_map
		}
	});
}

/** Generate Ajv compatible custome error */
export function errorObject(prop: string, message: string) {
	return {
		instancePath: prop == GLOBAL_ERROR ? "" : `/${prop}`,
		schemaPath: prop == GLOBAL_ERROR ? "#/errorMessage" : `#/properties/${prop}/errorMessage`,
		keyword: "errorMessage",
		params: {
			errors: [],
			form_failure: true
		},
		message
	};
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
