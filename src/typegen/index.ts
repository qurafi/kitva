import { SchemaBuilder, resolveSchemaRef } from "ajv-build-tools";
import { compileJsonSchemaTypes } from "./jschema2ts.js";

interface CompileContext {
    builder: SchemaBuilder;
    file: string;
}

type CompileOptions = CompileContext & {
    onSchema?(name: string, file: string): void;
};

export async function compileFileJsonSchemaToTs({
    builder,
    file,
    onSchema,
}: CompileOptions) {
    let source = "";
    const ajv = builder.ajvInstances.server;
    const file_schemas = builder.getFileJsonSchemas(file, true) || {};
    if (!file_schemas) {
        return;
    }

    for (const [name, schema] of Object.entries(file_schemas)) {
        const code = await compileJsonSchemaTypes(
            ajv,
            name,
            schema,
            resolveSchemaRef(file, name)
        );

        await onSchema?.(name, file);

        source += code + "\n";
    }

    return source;
}
