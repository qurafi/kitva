import { type ErrorObject, type ValidateFunction } from "ajv";
import type { ValidateFn } from "kitva/hook/types.js";
import type { AnyValue, ValidationResult } from "kitva/types.js";

// the message is always defined when ajv option "messages" is true(default),
export type AjvError = ErrorObject & { message: string };

// for errors that aren't related to a field
export const GLOBAL_ERROR = "$$error";

/** Converts Ajv errors into {form_field: error} */
export function generateErrorMap(_errors: AjvError[]) {
    const errors: Record<string, AjvError> = {};
    for (const err of _errors) {
        // with errorMessage keyword(ajv-errors), original error info is in params.error
        const param_err = err.params?.errors?.[0];
        if (err.keyword == "required" || param_err?.keyword == "required") {
            const params = param_err?.params || err.params;
            errors[params.missingProperty] = err;
            continue;
        }
        const path = err.instancePath.split("/")[1];
        if (!path) {
            errors[GLOBAL_ERROR] = err;
            continue;
        }

        errors[path] = err;
    }
    return errors;
}

export const getFormErrors = generateErrorMap;

export function createValidateFn(validate: ValidateFunction, clone = false) {
    return ((input) => {
        let data = input;
        if (clone) {
            data = JSON.parse(JSON.stringify(data));
        }

        const valid = validate(data);
        if (!valid) {
            return {
                valid: false,
                errors: validate.errors as AjvError[],
                input,
            };
        }

        return {
            valid: true,
            data,
            input,
        };
    }) satisfies ValidateFn<AnyValue, AjvError>;
}
