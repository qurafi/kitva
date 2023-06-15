import type { AnyError, AnyMap, AnyValue } from "../types.js";
import type { Readable, Writable } from "svelte/store";
import type { ValidationResult } from "../types.js";
import type { ActionReturn } from "svelte/action";
export interface FormValidationClient<Data = AnyMap, Error extends AnyError = AnyError> {
	validate_result: Readable<ValidationResult<Data, Error>>;

	/** alias of $validate_result.valid */
	is_valid: Readable<boolean>;

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

	/**
	 * Raw errors
	 */
	errors: Readable<Record<keyof Data, Error>>;

	/** Readable store returns the data when it's valid and it's type safe
	 *
	 * alias for ${@link validate_result}.data
	 */
	form_data: Readable<Data | undefined>;

	validateForm(field?: string): void;
	action_url: string;
	action(form: HTMLFormElement): ActionReturn<void>;
}

export type GeneratedValidationClient<
	Data extends AnyMap = AnyMap,
	Errors extends AnyError = AnyError
> = (options: {
	fields: Partial<Data> | Readable<Partial<Data>>;
	use_enhance?: boolean | undefined;
}) => FormValidationClient<Data, Errors>;
