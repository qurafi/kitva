import type { AjvError, GLOBAL_ERROR } from "$lib/runtime/ajv/index.js";
import type { ActionReturn } from "svelte/action";
import type { Readable, Writable } from "svelte/store";
import type { AnyMap, ValidationResult } from "../types.js";
import type { ValidateFnCompiled } from "./hooks.js";
import type { JSONSchemaType } from "ajv";
import type { Localize } from "$lib/runtime/ajv/localization.js";

export type TGlobalError = typeof GLOBAL_ERROR;

export interface FormValidationClient<Data = AnyMap> {
	/** Contains
	 * ```typescript
	 * {valid:boolean, data: Data, errors: Record<string, Error>, input: AnyMap}
	 * ```
	 **/
	result: Readable<ValidationResult<Data>>;

	loading: Readable<boolean>;

	/** usage with binding values, not type safe because fields could be invalid or missing */
	fields: Writable<Partial<Record<keyof Data, any>>>;

	/**
	 * UI Optimized error messages
	 * - Appear when user start typing into the field
	 * - Delayed 250ms
	 *
	 * NOTE: if you want to access directly the raw errors, use ${@link errors}
	 *
	 * */
	errs: Readable<Partial<Record<keyof Data | TGlobalError, string>>>;

	errors: Readable<Partial<Record<keyof Data | TGlobalError, AjvError>> | undefined>;

	validateForm(field?: string): void;

	action_url: string;
	action(form: HTMLFormElement): ActionReturn<void>;

	id: string;

	schema: JSONSchemaType<Data>;
}

export interface ClientOptions<Data> {
	fields?: Partial<Data>;
	use_enhance?: boolean;
	use_storage?: boolean;
	warn_user?: boolean;
	form_id: string;
	locale?: string | boolean;
}

export interface CreateClientOption<Data> extends ClientOptions<Data> {
	validate: ValidateFnCompiled<Data>;
	action: string;
	localize: Localize;
}

export type GeneratedClientOptions<Data> = Omit<ClientOptions<Data>, "form_id">;

export type GeneratedValidationClient<Data> = (
	options?: GeneratedClientOptions<Data>
) => FormValidationClient<Data>;

export type FormResult<Name extends string = string, Data = AnyMap> = {
	action: Name;
	input: Record<keyof Data, any>;
	errors?: Record<keyof Data, AjvError | undefined>;
};

export type FormResults<T, Data> = {
	[k in keyof T]: T[k] extends (...args: any) => any
		? (
				event: Parameters<T[k]>[0]
		  ) => Awaited<ReturnType<T[k]>> &
				FormResult<k & string, k extends keyof Data ? Data[k] : never>
		: never;
};
