import { randomInt } from "crypto";
import { compile } from "json-schema-to-typescript";
import Ajv from "ajv";
import { resolveUrl } from "ajv/dist/compile/resolve.js";
import fastUri from "fast-uri";
import { dirname } from "path";

export async function compileJsonSchemaTypes(
    ajv: Ajv.default,
    name: string,
    schema: any,
    ref?: string
) {
    const generated_name = uid();

    if (!schema.$id && !ref) {
        throw new Error("ref is required when schema.$id is undefined");
    }

    const base_id = dirname(schema.$id ?? ref);

    // json-schema-to-typescript use $id for generated interface so we override with the name we want
    // it still try to format the name so we give it a uid and then replace it with our desired name
    const code = await compile(
        { ...schema, $id: generated_name, title: undefined },
        name,
        {
            declareExternallyReferenced: true,
            additionalProperties: true,

            format: false,
            cwd: base_id,
            bannerComment: "",

            $refOptions: {
                resolve: {
                    file: false,
                    http: false,
                    external: true,
                    ajv: ajvResolver(ajv, base_id),
                },
            },
        }
    );

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
            const id = resolveUrl(fastUri, base_id, url);

            const schema_env = ajv.getSchema(id);
            if (!schema_env) {
                throw new Error(`Could not resolve schema ${file.url} for type gen`);
            }
            return schema_env.schema;
        },
    };
}

function uid() {
    return `_${randomInt(2 ** 48 - 1)}`;
}
