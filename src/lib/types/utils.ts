import type { AnyRequestEvent, EventWithValidation } from "$lib/types.js";
import type { TGlobalError } from "./forms.js";

export type InferData<T> = T extends AnyRequestEvent
	? T extends EventWithValidation<infer Data, boolean, any, T>
		? Data
		: never
	: never;

export type GetBody<T> = "body" extends keyof T ? T["body"] : never;
export type ErrorOfFields<T> = Partial<Record<keyof GetBody<InferData<T>> | TGlobalError, string>>;

export type ExtractActionName<T> = T extends EventWithValidation<any, any, infer R> ? R : never;
