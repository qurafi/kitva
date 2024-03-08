import type { Plugin as AjvToolsPlugin } from "ajv-build-tools";
import { zodToJsonSchema } from "zod-to-json-schema";
import { bold } from "kleur/colors";
import { HTTP_METHODS, HTTP_PARTS } from "$lib/shared/constants.js";
import { defer_warn } from "$lib/shared/logger.server.js";
import { KitvaError } from "$lib/shared/utils.js";

export const allowed_exports = new Set([...HTTP_METHODS, "actions"]);
export const allowed_parts = new Set<string>(HTTP_PARTS);

type Module = Record<string, Record<string, unknown>>;

/*
Resolve from:
 export GET = {queries: {}}
 export POST = {body: {}}
 export actions = {default: {body}}
 
To:
 export GET_queries = {}
 export POST_body = {}
 export actions_default_body = {}

 So we could have a linear exports in the generated modules
*/
export function resolveRoutesSchemas(module: Module, file: string) {
	const schemas: Record<string, unknown> = {};

	for (const export_name of Object.keys(module)) {
		const export_value = module[export_name];

		if (!allowed_exports.has(export_name)) {
			warnAboutExports(export_name, file);
			continue;
		}

		if (!export_value || typeof export_value !== "object") {
			throw KitvaError(`${file} - ${export_name} must be object `);
		}

		for (const part of Object.keys(export_value)) {
			if (export_name !== "actions" && !allowed_parts.has(part)) {
				warnAboutUnknownPart(part, export_name, file);
				continue;
			}
			if (export_name == "GET" && part == "body") {
				warnAboutGetBody(file);
				continue;
			}
			schemas[`${export_name}_${part}`] = export_value[part];
		}
	}

	return schemas;
}

export function routeSchemasResolver(): AjvToolsPlugin {
	return {
		async resolveModule(module, file) {
			if (file.startsWith("routes/")) {
				return resolveRoutesSchemas(module, file);
			}

			return module;
		}
	};
}

function warnAboutGetBody(file: string) {
	defer_warn(`${bold(file)}: body in GET is not allowed`);
}

function warnAboutUnknownPart(part: string, method: string, file: string) {
	defer_warn(`${bold(file)}: ${method} exported unknown http part ${part}. it will be ignored`);
}

function warnAboutExports(not_allowed_export: string, file: string) {
	defer_warn(
		`${bold(file)} has non allowed export '${bold(not_allowed_export)}' and it will be ignored`
	);
}

export function resolveZodSchemas() {
	return {
		resolveSchema(schema) {
			const is_zod_schema = schema?._def?.typeName?.startsWith("Zod");
			if (is_zod_schema) {
				return zodToJsonSchema(schema, {
					errorMessages: true
				});
			}

			return schema;
		}
	} satisfies AjvToolsPlugin;
}

export function resolveFormObjectType(): AjvToolsPlugin {
	return {
		resolveSchema(schema, file, name) {
			if (!file.startsWith("routes/") || !name.startsWith("actions_")) {
				return schema;
			}

			if (schema.type && schema.type !== "object") {
				throw KitvaError(
					`Form actions schema must be a type of object, got ${schema.type}. at ${file}:${name}`
				);
			}

			return { additionalProperties: false, ...schema, type: "object" };
		}
	};
}
