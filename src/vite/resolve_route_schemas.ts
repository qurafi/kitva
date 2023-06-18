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

type Module = Record<string, Record<string, unknown>>;

export function resolveRoutesSchemas(module: Module, file: string) {
	const schemas: Record<string, unknown> = {};

	for (const export_name of Object.keys(module)) {
		const export_value = module[export_name];
		if (!export_value || typeof export_value !== "object") {
			throw new Error(`Kitva: ${export_name}`);
		}

		if (!allowed_exports.has(export_name)) {
			warnAboutExports(export_name, file);
			continue;
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
