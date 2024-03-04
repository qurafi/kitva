import type { GLOBAL_ERROR } from "$lib/ajv/index.js";
import type { GetFormErrors, ValidateFn } from "$lib/hooks/types.js";
import type { MaybePromise } from "$lib/utils/index.js";
import type { RequestEvent } from "@sveltejs/kit";
import type { ActionReturn } from "svelte/action";
import type { Readable, Writable } from "svelte/store";
import type { AnyError, AnyMap, ValidationResult } from "../types.js";

type TGLOBAL_ERROR = typeof GLOBAL_ERROR;

export interface FormValidationClient<Data = AnyMap, Error extends AnyError = AnyError> {
	/** Contains
	 * ```typescript
	 * {valid:boolean, data: Data, errors: Record<string, Error>, input: AnyMap}
	 * ```
	 **/
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
	errs: Readable<Partial<Record<keyof Data | TGLOBAL_ERROR, string>>>;

	errors: Readable<Partial<Record<keyof Data | TGLOBAL_ERROR, Error>> | undefined>;

	validateForm(field?: string): void;

	action_url: string;
	action(form: HTMLFormElement): ActionReturn<void>;

	id: string;

	schema: Record<string, any>;
}

export interface ClientOptions<Data extends AnyMap = AnyMap> {
	fields?: Partial<Data>;
	use_enhance?: boolean;
	use_storage?: boolean;
	warn_user?: boolean;
	form_id: string;
	locale?: string | boolean;
}

export interface CreateClientOption extends ClientOptions {
	validate: ValidateFn;
	action: string;
	getFormErrors: GetFormErrors;
	localize: Localize;
}

export type Localize = (
	lang: string,
	errors: AnyError[] | undefined | null,
	event?: RequestEvent
) => MaybePromise<void>;

export type GeneratedValidationClient<
	Data extends AnyMap = AnyMap,
	Errors extends AnyError = AnyError
> = (options?: Omit<ClientOptions<Data>, "form_id">) => FormValidationClient<Data, Errors>;
