import type { Plugin as AjvToolsPlugin } from "ajv-build-tools";
import { zodToJsonSchema } from "zod-to-json-schema";

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
