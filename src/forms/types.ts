import type { AnyError, AnyValue } from "kitva/types.js";
import type { Writable } from "svelte/store";

export interface FormValidationClient<
    Data = AnyValue,
    Error extends AnyError = AnyError
> {
    is_valid: Writable<boolean>;
    fields: Writable<Data>;
    errors: Writable<Record<keyof Data, Error>>;
    action(form: HTMLFormElement): void;
    action_url: string;
}
