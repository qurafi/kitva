import { page } from "$app/stores";
import { type Writable, get, writable } from "svelte/store";
import { objectMap } from "../utils/objectMap.js";
import type { FormValidationClient } from "./types.js";
import type { AnyError, AnyMap } from "kitva/types.js";
import type { GetFormErrors, ValidateFn } from "kitva/hook/types.js";
import { form_urlencoded } from "../svelte_helpers/http.js";

export function createValidationClient(
    validate: ValidateFn,
    action: string,
    initial_fields: AnyMap,
    getFormErrors: GetFormErrors
): FormValidationClient {
    const _fields = writable(filterEmptyFields(initial_fields));
    const fields: Writable<AnyMap> = {
        ..._fields,
        set(value) {
            console.log({ value });
            _fields.set(filterEmptyFields(value));
        },
    };

    const errors = writable<Record<string, string>>({});
    const is_valid = writable<boolean>(true);

    // we make sure to validate initial fields
    if (Object.keys(initial_fields).length) {
        validateForm();
    }

    page.subscribe(({ form }) => {
        const form_result = form?.[`__form_${action}`];
        if (form_result) {
            setForm(form_result);
        }
    });

    function setForm(result: any) {
        const { input, errors: form_errors } = result;
        fields.set(input);
        if (form_errors) {
            setErrors(form_errors);
            is_valid.set(false);
        }
    }

    function setErrors(errors_: any) {
        errors.update((errs) => {
            return {
                ...errs,
                ...objectMap(errors_, (err) => err?.message || ""),
            };
        });
    }

    function validateForm(field?: string) {
        const status = validate(get(fields));
        const { valid, errors: raw_errors } = status;
        is_valid.set(!!valid);
        if (!valid && field) {
            const form_errors = getFormErrors(raw_errors);
            errors.update((errs) => {
                errs[field] = form_errors[field]?.message;
                return errs;
            });
        } else {
            if (valid) {
                errors.set({});
            } else {
                setErrors(getFormErrors(raw_errors));
            }
        }
        return status;
    }
    return {
        fields,
        errors,
        is_valid,
        action: (form) => {
            if (form.enctype !== form_urlencoded) {
                console.warn(`it's better to use ${form_urlencoded} enctype for forms`);
            }
            let timeout: any;

            form.addEventListener("input", (e) => {
                const target = e.target as HTMLElement;
                const name = target?.getAttribute("name");
                if (!name) return;
                clearTimeout(timeout);

                timeout = setTimeout(() => validateForm(name), 250);
            });

            form.addEventListener("submit", (ev) => {
                const { valid } = validateForm();
                if (!valid) {
                    ev.preventDefault();
                    ev.stopImmediatePropagation();
                }
            });
        },
        action_url: action == "default" ? "" : `/?${action}`,
    };
}

// we will treat any empty string as undefined as all formData entry is either a file or a string
function filterEmptyFields(input: AnyMap) {
    const filtered = Object.entries(input).filter(([_, value]) => {
        return value !== "";
    });
    return Object.fromEntries(filtered);
}

export type GeneratedValidationClient<
    Data extends AnyMap = AnyMap,
    Errors extends AnyError = AnyError
> = (initial_fields: Partial<Data>) => FormValidationClient<Data, Errors>;
