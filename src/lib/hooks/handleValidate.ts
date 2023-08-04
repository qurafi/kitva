import { KitvaError, type MaybePromise } from "$lib/utils/index.js";
import type { AnyHandler, RequestHandlerWithValidation, ValidationResults } from "../types.js";
import type { getRequestContent } from "../utils/svelte.js";

export const validation_hooks = new WeakMap<AnyHandler, HandleValidate>();

/**
 * Change the behavior of validation for specific handler.
 *
 * Returning false will skip validation.
 *
 * if validate() is not called in the callback and the validation is not explicitly skipped
 *  - in dev mode, an error will be thrown
 *  - in production, it will call validate
 * */
export function handleValidate<T extends AnyHandler>(handler: T, callback: HandleValidate<T>) {
	const old_hook = validation_hooks.get(handler);
	if (old_hook && old_hook !== callback) {
		throw KitvaError("handleValidate - already registered validate hook");
	}
	validation_hooks.set(handler, callback);
}

type Input = Awaited<ReturnType<typeof getRequestContent>>;

type GetValidateOf<T> = T extends RequestHandlerWithValidation<any, infer Data, infer Error, any>
	? () => Promise<ValidationResults<Data, Error, boolean>>
	: never;

export type HandleValidate<T extends AnyHandler = AnyHandler> = (params: {
	event: Parameters<T>["0"] & { locals: { validation: never } };
	input: Input;
	validate: GetValidateOf<T>;
}) => MaybePromise<boolean | void | undefined>;
