//@ts-nocheck
import { $action_export$ as ajv_validate } from "$compiled_schema$";

import { createValidationClient } from "kitva/forms/client";

import { createValidateFn, getFormErrors } from "kitva/presets/ajv/index";

export function createValidate(initial_fields) {
    const validate = createValidateFn(ajv_validate, true);

    return createValidationClient(validate, $action_name$, initial_fields, getFormErrors);
}
