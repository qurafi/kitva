/// <reference types="ajv-build-tools/types" />

import { warn } from "$lib/shared/logger.server.js";
import { createAjvValidateFn } from "./index.js";
import type { ValidationContext } from "$lib/types/hooks.js";
import { DEV } from "esm-env";
import schemas from "$schemas?t=all";

export async function getValidationFunction(ctx: ValidationContext) {
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

	return createAjvValidateFn(validate, true);
}
