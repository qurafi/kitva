// loaded by vite
// import schemas from "$schemas?t=all";

type Schemas = typeof import("$schemas?t=all").default;

import { createDebug } from "../../utils/index.js";
import { json } from "@sveltejs/kit";
import { AjvError, generateErrorMap } from "./index.js";
import { ValidationOptions } from "../../hook/types.js";
import { dev } from "$app/environment";
import { ValidationResult } from "../../types.js";

const debug = createDebug("ajv:server");

export function createPreset(schemas: Schemas): ValidationOptions {
    const preset: ValidationOptions = {
        async getValidation(ctx) {
            const sep = ctx.routeId == "/" ? "" : "/";
            const r = `routes${ctx.routeId}${sep}schemas`;
            const route_schemas = await schemas[r]?.();

            if (!route_schemas) {
                return;
            }

            const schema = ctx.isEndpoint
                ? `${ctx.method}_${ctx.part}`
                : `actions_${ctx.action}`;

            const validate = route_schemas[schema];
            if (!validate) {
                if (dev) {
                    console.log("%s does not have a schema for %s", ctx.routeId, schema);
                }
                return;
            }

            return (data) => {
                const valid = validate(data);

                // ajv assigns last errors globally on the validate function
                // also it mutates directly its input data if configured(e.g. defaults and coercion)
                // ajv will mutate the data as it validate if the property is valid
                return {
                    valid,
                    errors: validate.errors,
                    input: data as any,
                    data: valid ? data : undefined,
                } as ValidationResult;
            };
        },

        getFormErrors(errors) {
            return generateErrorMap(errors as AjvError[]);
        },

        getError(errors: AjvError[], part: string) {
            const e = errors?.[0];
            const message = e
                ? `${part}${e.instancePath || ""} ${e.message}`
                : `${part} validation error`;
            return { ...e, message };
        },

        getEndpointError(errors: AjvError[], part) {
            const error = preset.getError(errors, part);
            return json(
                {
                    error: "Bad Request",
                    code: "VALIDATION_ERROR",
                    message: error.message,
                },
                { status: 400 }
            );
        },
    };
    return preset;
}
