import { KitvaError } from "$lib/utils/index.js";
import type { Plugin as AjvToolsPlugin } from "ajv-build-tools";

export function resolveFormObjectType(): AjvToolsPlugin {
	return {
		resolveSchema(schema, file, name) {
			if (!file.startsWith("routes/") || !name.startsWith("actions_")) {
				return schema;
			}

			if (schema.type && schema.type !== "object") {
				throw KitvaError(
					`Form actions must be object, got ${schema.type}. at ${file}:${name}`
				);
			}

			return { additionalProperties: false, ...schema, type: "object" };
		}
	};
}
