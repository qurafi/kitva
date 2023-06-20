import { warn } from "$lib/utils/index.js";
import type { Plugin as AjvToolsPlugin } from "ajv-build-tools";

export function validateFormObjectType(): AjvToolsPlugin {
	return {
		onFile({ builder, relativePath }) {
			const schemas = builder.getFileJsonSchemas(relativePath);
			if (!schemas || !relativePath.startsWith("routes/")) {
				return;
			}
			for (const [name, schema] of Object.entries(schemas)) {
				if (name.startsWith("actions_") && schema.type !== "object") {
					warn("Action schemas should be type of object, original schema", schema);
				}
			}
		}
	};
}
