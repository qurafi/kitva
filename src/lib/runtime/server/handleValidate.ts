import { KitvaError, type MaybePromise } from "$lib/shared/utils.js";
import type { AnyRequestEvent, EventWithValidation, ValidationResults } from "../../types.js";
import type { getRequestContent } from "./utils/server.js";

type AnyHandler = (event: any) => any;

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
		throw new KitvaError("handleValidate - already registered validate hook");
	}
	validation_hooks.set(handler, callback);
}

type Input = Awaited<ReturnType<typeof getRequestContent>>;

type inferData<T> = T extends AnyRequestEvent
	? T extends EventWithValidation<infer Data, boolean, any, T>
		? Data
		: never
	: never;

export type HandleValidate<T extends AnyHandler = AnyHandler> = (params: {
	event: Parameters<T>["0"] & { locals: { validation: never } };
	input: Input;
	validate: () => MaybePromise<ValidationResults<inferData<Parameters<T>["0"]>>>;
}) => MaybePromise<boolean | void | undefined>;
