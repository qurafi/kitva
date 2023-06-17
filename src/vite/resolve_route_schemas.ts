import { bold } from "kleur/colors";
import { HTTP_METHODS, HTTP_PARTS, warn } from "../utils/index.js";

/*
Resolve from:
 export GET = {queries: {}}
 export POST = {body: {}}
 export actions = {default: {body}}
 
to:
 export GET_queries = {}
 export POST_body = {}
 export actions_default_body = {}

 This way, we will not have to deal about modifying the generated code from ajv
*/

export const allowed_exports = new Set([...HTTP_METHODS, "actions"]);
export const allowed_parts = new Set<string>(HTTP_PARTS);

export function resolveRoutesSchemas(module: Record<string, any>, file: string) {
	const schemas: Record<string, any> = {};

	for (const exprt_name of Object.keys(module)) {
		const exprt_value = module[exprt_name];
		if (!allowed_exports.has(exprt_name)) {
			warnAboutExports(exprt_name, file);
			continue;
		}

		for (const part of Object.keys(exprt_value)) {
			if (exprt_name !== "actions" && !allowed_parts.has(part)) {
				warnAboutUnknownPart(part, exprt_name, file);
				continue;
			}
			if (exprt_name == "GET" && part == "body") {
				warnAboutGetBody(file);
				continue;
			}
			schemas[`${exprt_name}_${part}`] = exprt_value[part];
		}
	}

	return schemas;
}

function warnAboutGetBody(file: string) {
	warn(`${bold(file)}: body in GET is not allowed`);
}

function warnAboutUnknownPart(part: string, method: string, file: string) {
	warn(`${bold(file)}: ${method} exported unkown http part ${part}. it will be ignored`);
}

function warnAboutExports(not_allowed_export: string, file: string) {
	warn(
		`${bold(file)} has non allowed export '${bold(not_allowed_export)}' and it will be ignored`
	);
}
