import { HTTP_METHODS, LIB_NAME } from "$lib/shared/constants.js";
import type { MaybePromise } from "$lib/shared/utils.js";
import { KitvaError } from "$lib/shared/utils.js";
import type Ajv from "ajv";
import { resolveSchemaRef, type SchemaBuilder } from "ajv-build-tools";
import { resolveUrl } from "ajv/dist/compile/resolve.js";
import { compile } from "json-schema-to-typescript";
import { randomInt } from "node:crypto";
import { dirname } from "node:path";
import { generateFormClientFunction, getNamedImports } from "./form.js";

// svelte-package resolves $lib aliases at build time regardless if it's in a string or not
const LIB_ALIAS = Buffer.from("JGxpYi92YWxpZGF0aW9u", "base64url").toString("utf-8");

const HEADER = `// Code generated by ${LIB_NAME}, DO NOT EDIT `;

export const HANDLERS_STATIC_IMPORTS = `
import type { RewriteHandlers } from "kitva/generated"
import type { RequestHandler } from "./$types.js";`;

const CLIENT_STATIC_IMPORTS = `
import type { Actions as Actions_ } from "./$types.js";
import {type RewriteActions, type FormResults, withValidation as wv, defineGenerated} from "kitva/generated";`;

const CLIENT_STATIC_CODE = `
type ActionsData = Schemas["actions"];

type Actions = RewriteActions<ActionsData, Actions_>;


export function withValidation<T extends Actions>(actions: T) {
	return wv(actions as FormResults<T, ActionsData>);
}
`;

export async function generateTypes(
	builder: SchemaBuilder,
	file: string,
	is_route_schema: boolean
) {
	const forms: string[] = [];
	const methods = new Set<string>();
	const exported_schemas: ExportedRouteSchemas = {};
	const body = [];
	const header = [HEADER];

	const type_declarations_code = await compileJsonSchemaFileToTs({
		builder,
		file: file,
		async onSchema(name) {
			if (!is_route_schema) {
				return;
			}

			// inline routes schemas
			const is_action_schema = name.startsWith("actions_");
			const is_method_schema = HTTP_METHODS.some((method) => name.startsWith(method + "_"));
			if (is_method_schema || is_action_schema) {
				const [method] = name.split("_", 1);
				if (is_method_schema) {
					methods.add(method);
				}

				(exported_schemas[method] ??= []).push(`${name.slice(method.length + 1)}: ${name}`);
			}

			if (is_action_schema) {
				const action = name.slice("actions_".length);
				forms.push(action);
			}
		}
	});

	if (!type_declarations_code) {
		return;
	}

	body.push(type_declarations_code);

	if (type_declarations_code && is_route_schema) {
		body.push(constructRouteSchemaInterface(exported_schemas));
	}

	if (is_route_schema) {
		if (methods.size) {
			header.push(HANDLERS_STATIC_IMPORTS);

			body.push(`\ntype RequestHandlers = RewriteHandlers<Schemas, RequestHandler>;`);

			for (const method of methods) {
				body.push(`\nexport type ${method}Handler = RequestHandlers["${method}"];`);
			}
		}

		if (forms.length) {
			header.push(
				CLIENT_STATIC_IMPORTS,
				`import { ${getNamedImports(forms)} } from "$schemas/${file}";`,
				//TODO use global option for localize and other client options
				`import { localize } from "${LIB_ALIAS}/localization";\n`
			);

			body.push(
				CLIENT_STATIC_CODE,
				forms.map((form) => generateFormClientFunction(form)).join("\n\n")
			);
		}
	}

	const code = [header, "", body].flat().join("\n").trim();

	return {
		code
	};
}

interface CompileContext {
	builder: SchemaBuilder;
	file: string;
}

type CompileOptions = CompileContext & {
	onSchema?(name: string, file: string): MaybePromise<void>;
};

export async function compileJsonSchemaFileToTs({ builder, file, onSchema }: CompileOptions) {
	let source = "";
	const ajv = builder.ajvInstances.server;
	const file_schemas = builder.getFileJsonSchemas(file, true) || {};
	if (!file_schemas) {
		return;
	}

	for (const [name, schema] of Object.entries(file_schemas)) {
		const code = await compileJsonSchemaTypes(ajv, name, schema, resolveSchemaRef(file, name));

		await onSchema?.(name, file);

		source += code + "\n";
	}

	return source;
}

type ExportedRouteSchemas = Record<string, string[]>;

function constructRouteSchemaInterface(schemas: ExportedRouteSchemas) {
	const schema_props = Object.entries(schemas)
		.map(([method, props]) => {
			return `\t${method}: {\n\t\t${props.join("\n\t\t")}\n\t}`;
		})
		.join("\n");

	return `export interface Schemas {\n${schema_props}\n}`;
}

export async function compileJsonSchemaTypes(
	ajv: Ajv.default,
	name: string,
	schema: any,
	ref?: string
) {
	const generated_name = `_${randomInt(2 ** 48 - 1)}`;

	if (!schema.$id && !ref) {
		throw new KitvaError("ref is required when schema.$id is undefined");
	}

	const base_id = dirname(schema.$id ?? ref);

	// json-schema-to-typescript use $id as interface name so we override with the name we want
	// it still try to format the name so we give it a numberic uid and then replace it with our desired name
	const code = await compile({ ...schema, $id: generated_name, title: undefined }, name, {
		declareExternallyReferenced: true,
		additionalProperties: true,
		unknownAny: false,

		format: false,
		cwd: base_id,
		bannerComment: "",

		$refOptions: {
			resolve: {
				file: false,
				http: false,
				external: true,
				ajv: ajvResolver(ajv, base_id)
			}
		}
	});

	return code
		.replace(generated_name, name)
		.replace(/export (interface|type) ([^\s]+) /g, (str, keyword, type_name) => {
			if (name == type_name) {
				return str;
			}
			return `${keyword} ${type_name}`;
		});
}

function ajvResolver(ajv: Ajv.default, base_id: string) {
	return {
		canRead: true,
		async read(file: any) {
			let url = file.url as string;
			if (url.startsWith("/")) {
				url = url.slice(1);
			}

			const id = resolveUrl(ajv.opts.uriResolver, base_id, url);

			const schema_env = ajv.getSchema(id);
			if (!schema_env) {
				throw new KitvaError(`Could not resolve schema ${file.url} for type gen`);
			}
			return schema_env.schema;
		}
	};
}
