/// <reference types="ajv-build-tools/types" />

import { warn } from "$lib/utils/server.js";
import { json } from "@sveltejs/kit";
import { type AjvError, createValidateFn, generateErrorMap } from "./index.js";
import type { ValidationOptions } from "$lib/hooks/types.js";
import { DEV } from "esm-env";
import { validationHook } from "$lib/hooks/hook.js";

type Schemas = typeof import("$schemas?t=all").default;

export function getValidationHook(schemas: Schemas, options?: ValidationOptions) {
	return validationHook({
		...options,
		...createPreset(schemas)
	});
}

export function createPreset(schemas: Schemas): ValidationOptions {
	const preset: ValidationOptions = {
		async getValidation(ctx) {
			const sep = ctx.routeId == "/" ? "" : "/";
			const r = `routes${ctx.routeId}${sep}schemas`;
			const route_schemas = await schemas[r]?.();

			if (!route_schemas) {
				return;
			}

			const schema = ctx.isEndpoint ? `${ctx.method}_${ctx.part}` : `actions_${ctx.action}`;

			const validate = route_schemas[schema];
			if (!validate) {
				if (DEV && schema !== "GET_body") {
					warn("%s does not have a schema for %s", ctx.routeId, schema);
				}
				return;
			}

			return createValidateFn(validate, true);
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
					message: error.message
				},
				{ status: 400 }
			);
		}
	};
	return preset;
}
