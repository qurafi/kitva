import type { AnyError, AnyMap } from "../types.js";
import type { Readable, Writable } from "svelte/store";
import type { ValidationResult } from "../types.js";
import type { ActionReturn } from "svelte/action";
import type { GetFormErrors, ValidateFn } from "$lib/hooks/types.js";
export interface FormValidationClient<Data = AnyMap, Error extends AnyError = AnyError> {
	/** Contains
	 * ```typescript
	 * {valid:boolean, data: Data, errors: Record<string, Error>, input: AnyMap}`
	 * ``` */
	result: Readable<ValidationResult<Data, Error>>;

	loading: Readable<boolean>;

	/** usage with binding values, not type safe because fields could be invalid or missing */
	fields: Writable<Partial<Record<keyof Data, any>>>;

	/**
	 * Optmized error messages for UI
	 * - errors are set to the specific field user start typing into
	 * - errors are delayed 250ms after the start of typing
	 *
	 * NOTE: if you want to access directly the raw errors, use ${@link errors}
	 *
	 * */
	errs: Readable<Partial<Record<keyof Data, string>>>;

	errors: Readable<Partial<Record<keyof Data, Error>> | undefined>;

	validateForm(field?: string): void;
	action_url: string;
	action(form: HTMLFormElement): ActionReturn<void>;
}

export interface ClientOptions<Data extends AnyMap = AnyMap> {
	fields?: Partial<Data>;
	use_enhance?: boolean;
	use_storage?: boolean;
	warn_user?: boolean;
}

export interface CreateClientOption extends ClientOptions {
	validate: ValidateFn;
	action: string;
	getFormErrors: GetFormErrors;
}

export type GeneratedValidationClient<
	Data extends AnyMap = AnyMap,
	Errors extends AnyError = AnyError
> = (options?: ClientOptions<Data>) => FormValidationClient<Data, Errors>;
