import { localize } from "$lib/runtime/ajv/localization.js";
import { KitvaError, objectMap } from "$lib/shared/utils.js";
import type { Actions } from "@sveltejs/kit";
import type {
	AnyError,
	AnyMap,
	AnyRequestEvent,
	EventWithValidation,
	ValidationParts
} from "../../types.js";
import { GLOBAL_ERROR } from "$lib/runtime/ajv/index.js";

export function withValidation<T extends Actions>(t: T) {
	const out: Actions = {};
	for (const [name, action] of Object.entries(t)) {
		out[name] = async (event) => {
			const { validation } = event.locals;

			if (validation && !validation.valid && validation.body?.valid === false) {
				await localize(event, validation.body.errors);
				return {
					action: name,
					[`__form_${name}`]: {
						input: validation.body.input,
						errors: validation.formErrors
					}
				};
			}

			const result = await action(event);
			return { action: name, ...result };
		};
	}
	return out;
}

type ExtractFields<T> = T extends EventWithValidation<ValidationParts<{ body: infer R }>, any>
	? R
	: never;

type ErrorOfFields<T> = Partial<Record<keyof ExtractFields<T> | typeof GLOBAL_ERROR, string>>;

type ExtractActionName<T> = T extends EventWithValidation<any, infer R> ? R : never;

export async function formFailure<T extends AnyRequestEvent = AnyRequestEvent>(
	event: T,
	errors: ErrorOfFields<T> | string
) {
	const action = event.locals.action as ExtractActionName<T>;
	if (!action) {
		throw KitvaError("formFailure called outside form action");
	}

	if (typeof errors == "string") {
		errors = {
			[GLOBAL_ERROR]: errors
		} as ErrorOfFields<T>;
	}

	const error_map = objectMap(errors, (value, prop) => {
		return errorObject(prop, value);
	});

	await localize(event, Object.values(error_map));

	return {
		action,
		[`__form_${action}`]: {
			input: event.locals.validation?.body?.input,
			errors: error_map
		}
	} as FormResult<typeof action>;
}

/** Generate Ajv compatible custom error */
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

export type FormResult<T extends string> = {
	[k in `__form_${T}`]: {
		input: AnyMap;
		errors: Record<string, AnyError>;
	};
} & { action: T };
