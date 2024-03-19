import type { EventWithValidation, ValidationParts } from "$lib/types.js";
import type { TGlobalError } from "./forms.js";

type ExtractFields<T> = T extends EventWithValidation<ValidationParts<{ body: infer R }>, any>
	? R
	: never;

export type ErrorOfFields<T> = Partial<Record<keyof ExtractFields<T> | TGlobalError, string>>;

export type ExtractActionName<T> = T extends EventWithValidation<any, any, infer R> ? R : never;
