import type { Plugin as AjvToolsPlugin } from "ajv-build-tools";
import { zodToJsonSchema } from "zod-to-json-schema";
import { bold } from "kleur/colors";
import { HTTP_METHODS, HTTP_PARTS } from "$lib/shared/constants.js";
import { defer_warn } from "$lib/shared/logger.server.js";
import { KitvaError, isObject } from "$lib/shared/utils.js";

export const allowed_exports = new Set([...HTTP_METHODS, "actions"]);
export const allowed_parts = new Set<string>(HTTP_PARTS);

type Module = Record<string, unknown>;

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

		if (!isObject(export_value)) {
			throw new KitvaError(`${file} - ${export_name} must be object `);
		}

		for (const part of Object.keys(export_value)) {
			const is_action = export_name === "actions";
			if (!is_action && !allowed_parts.has(part)) {
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

export function routeSchemasResolver() {
	return {
		resolveModule(module, file) {
			//TODO handle baseDir
			if (file.startsWith("routes/")) {
				return resolveRoutesSchemas(module, file);
			}
		},
		resolveSchema(schema, file, name) {
			if (!file.startsWith("routes/")) {
				return;
			}

			if (!isObject(schema)) {
				throw new KitvaError(`${file} - ${name} must be object `);
			}

			const is_body = name.endsWith("body");
			if (!is_body) {
				schema.type ??= "object";

				if (schema.type !== "object") {
					throw new KitvaError(
						`${name} schema must be a type of object, got ${schema.type}. at ${file}`
					);
				}
			}

			const is_action = name.startsWith("actions");
			const is_params = name.endsWith("params");
			if ((is_body || is_params || is_action) && (!is_body || schema.type == "object")) {
				schema.additionalProperties ??= false;
			}
			return schema;
		}
	} satisfies AjvToolsPlugin;
}

export function resolveZodSchemas() {
	return {
		transformSchema(schema) {
			const is_zod_schema = schema?._def?.typeName?.startsWith("Zod");
			if (is_zod_schema) {
				return zodToJsonSchema(schema, {
					errorMessages: true
				});
			}
		}
	} satisfies AjvToolsPlugin;
}

export function resolveLibSchemas() {
	return {
		resolveSchema(schema) {
			if (schema.type == "object") {
				return { additionalProperties: false, ...schema };
			}
		}
	} satisfies AjvToolsPlugin;
}

const isProd = process.env.NODE_ENV == "production";

const throwOnProd = isProd
	? (msg: string) => {
			throw new KitvaError(msg);
	  }
	: defer_warn;

function warnAboutGetBody(file: string) {
	throwOnProd(`${bold(file)}: defining a body in a GET request is not allowed.`);
}

function warnAboutUnknownPart(part: string, method: string, file: string) {
	throwOnProd(
		`${bold(file)}: Schema of HTTP method '${method}' exports an unknown HTTP part '${part}'.`
	);
}

function warnAboutExports(not_allowed_export: string, file: string) {
	throwOnProd(
		`${bold(file)} has non allowed export '${bold(not_allowed_export)}' and it will be ignored`
	);
}
