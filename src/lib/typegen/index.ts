import { type SchemaBuilder, resolveSchemaRef } from "ajv-build-tools";
import { compileJsonSchemaTypes } from "./jschema2ts.js";
import { HTTP_METHODS, type MaybePromise } from "$lib/utils/index.js";

export async function generateTypes(
	builder: SchemaBuilder,
	file: string,
	is_route_schema: boolean
) {
	// store file
	const forms: string[] = [];
	const exported_schemas: ExportedRouteSchemas = {};

	let code = await compileFileJsonSchemaToTs({
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

				(exported_schemas[method] ??= []).push(`${name.slice(method.length + 1)}: ${name}`);
			}

			// write ./$form/action types
			if (is_action_schema) {
				const action = name.slice("actions_".length);
				forms.push(action);
			}
		}
	});

	if (code && is_route_schema) {
		code += constructRouteSchemaInterface(exported_schemas);
	}

	return {
		code: code,
		forms
	};
}

interface CompileContext {
	builder: SchemaBuilder;
	file: string;
}

type CompileOptions = CompileContext & {
	onSchema?(name: string, file: string): MaybePromise<void>;
};

export async function compileFileJsonSchemaToTs({ builder, file, onSchema }: CompileOptions) {
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
	const props = Object.entries(schemas)
		.map(([method, props]) => {
			return `\t${method}: {\n\t\t${props.join("\n\t\t")}\n\t}`;
		})
		.join("\n");

	return `export interface Schemas {\n${props}\n}`;
}
