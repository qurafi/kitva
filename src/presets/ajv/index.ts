import type { ErrorObject, ValidateFunction } from "ajv";
import type { AnyValue, JSONType, ValidationResult } from "../../types.js";
import { BROWSER } from "esm-env";
import rfdc from "rfdc";

// the message is always defined when ajv option "messages" is true(default),
export type AjvError = ErrorObject & { message: string };

export type AppLocal = ValidationResult<AnyValue, AjvError>;

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

const clone = BROWSER ? (data: unknown) => JSON.parse(JSON.stringify(data)) : rfdc();

export function createValidateFn(validate: ValidateFunction, clone_data = false) {
    return (input: unknown) => {
        const data = clone_data ? clone(input) : input;

        const valid = validate(data);

        // ajv assigns last errors globally on the validate function
        // also it mutates directly its input data if configured(e.g. defaults and coercion)
        // ajv will mutate the data as it validate if the property is valid
        return {
            valid,
            errors: validate.errors,
            input,
            data: valid ? data : undefined,
        } as ValidationResult<JSONType, AjvError>;
    };
}
