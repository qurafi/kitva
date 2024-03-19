import { dev } from "$app/environment";
import { GLOBAL_ERROR, createAjvErrorObject } from "$lib/runtime/ajv/index.js";
import { localize } from "$lib/runtime/ajv/localization.js";
import { warn } from "$lib/shared/logger.server.js";
import { KitvaError, objectMap } from "$lib/shared/utils.js";
import type { FormResult } from "$lib/types/forms.js";
import type { ErrorOfFields, ExtractActionName } from "$lib/types/utils.js";
import type { AnyActions, AnyRequestEvent } from "../../types.js";

const reserved = ["action", "input", "errors"];

export function withValidation<T extends AnyActions = AnyActions>(actions: T) {
	const new_actions: AnyActions = {};
	for (const [name, action] of Object.entries(actions)) {
		new_actions[name] = async (event) => {
			const { validation } = event.locals;

			if (validation && !validation.valid && validation.body?.valid === false) {
				await localize(event, validation.body.errors);

				return {
					action: name,
					input: validation.body.input,
					errors: validation.formErrors
				};
			}

			const result = await action(event as never);
			const is_reserved =
				result &&
				!Object.hasOwn(result, FormFailureSymbol) &&
				Object.keys(result).some((key) => reserved.includes(key));
			if (dev && is_reserved) {
				warn(
					`Action(${name}): returned reserved response. ${reserved.join(
						", "
					)} are reserved.`
				);
			}
			return { action: name, ...result };
		};
	}
	return new_actions as T;
}

const FormFailureSymbol = Symbol("FormFailureSymbol");

export async function formFailure<T extends AnyRequestEvent = AnyRequestEvent>(
	event: T,
	errors_or_res: { errors: ErrorOfFields<T> | string; data?: Record<string, any> } | string
) {
	const action = event.locals.action! as ExtractActionName<T>;

	if (!action) {
		throw new KitvaError(
			"event.locals.action is undefined. Make sure to call formFailure inside action or set up the hook correctly"
		);
	}

	let errors = typeof errors_or_res == "string" ? errors_or_res : errors_or_res.errors;

	if (typeof errors == "string") {
		errors = {
			[GLOBAL_ERROR]: errors
		} as ErrorOfFields<T>;
	}

	const error_map = objectMap(errors, (value, prop) => {
		return createAjvErrorObject(prop, value);
	});

	await localize(event, Object.values(error_map));

	const result = {
		action,
		input: event.locals.validation?.body?.input,
		errors: error_map,
		...(typeof errors_or_res == "object" && errors_or_res.data)
	} as FormResult<typeof action>;

	Object.defineProperty(result, FormFailureSymbol, {
		enumerable: false,
		value: true
	});

	return result;
}
