import type { AnyError, AnyMap, AnyValue } from "../types.js";
import type { Writable } from "svelte/store";
import type { ValidationResult } from "../types.js";
export interface FormValidationClient<
    Data = AnyValue,
    Error extends AnyError = AnyError
> {
    is_valid: Writable<boolean>;
    fields: Writable<Data>;
    errors: Writable<Record<keyof Data, Error>>;
    action(form: HTMLFormElement): void;
    action_url: string;
    validateForm(field?: string): ValidationResult;
}

export type GeneratedValidationClient<
    Data extends AnyMap = AnyMap,
    Errors extends AnyError = AnyError
> = (initial_fields: Partial<Data>) => FormValidationClient<Data, Errors>;
