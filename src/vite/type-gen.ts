import type { Plugin, SchemaBuilder } from "ajv-build-tools";
import path from "path";
import { compileFileJsonSchemaToTs } from "../typegen/index.js";
import { generate$formDts } from "../typegen/form.js";
import { HTTP_METHODS } from "../utils/index.js";
import { copyFile, mkdir, rm, writeFile } from "fs/promises";
import { fileURLToPath } from "url";

//TODO deal with the awkward plugin types
// type OnFile = NonNullable<Plugin["onFile"]>;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function typeGenPlugin(): Plugin {
    // we need to wait for all schemas in order for cross reference to work

    async function handleFile(builder: SchemaBuilder, file: string) {
        const { root, baseDir } = builder.config;

        const is_route_schema = file.startsWith("routes/");

        const abs_file = path.resolve(root, baseDir, file);

        // using typescript's rootDirs
        const root_dir = path.resolve(root, ".schemas/types");

        const base_dir = path.resolve(
            root_dir,
            path.dirname(path.relative(root, abs_file))
        );

        const $form_dir = path.resolve(base_dir, "./$form");

        await mkdir(base_dir, { recursive: true });

        const out = path.resolve(
            base_dir,
            is_route_schema
                ? "schema_types.d.ts"
                : `${path.basename(abs_file)}_types.d.ts`
        );

        const { code, forms } = await generateTypes(builder, file, is_route_schema);

        if (code) {
            await writeFile(out, code);
        }

        if (is_route_schema) {
            const src_$types2 = path.resolve(__dirname, "./$types.template.d.ts");
            await copyFile(src_$types2, path.resolve(base_dir, "$types2.d.ts"));
        }

        await rm($form_dir, { recursive: true, force: true });
        if (forms.length) {
            await mkdir($form_dir);
        }

        for (const action of forms) {
            const form_out = path.resolve($form_dir, `${action}.d.ts`);
            await writeFile(form_out, generate$formDts(action));
        }
    }

    return {
        async onFile(ctx) {
            if (!ctx.initial) {
                await handleFile(ctx.builder, ctx.relativePath);
            }
        },

        async buildEnd(builder) {
            const root_dir = path.resolve(builder.config.root, ".schemas/types");

            await rm(root_dir, { recursive: true, force: true });

            return Promise.all(
                [...builder.files.keys()].map((file) => {
                    return handleFile(builder, file);
                })
            );
        },
    };
}

async function generateTypes(
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
            const is_method_schema = HTTP_METHODS.some((method) =>
                name.startsWith(method + "_")
            );
            if (is_method_schema || is_action_schema) {
                const [method] = name.split("_", 1);

                (exported_schemas[method] ??= []).push(
                    `${name.slice(method.length + 1)}: ${name}`
                );
            }

            // write ./$form/action types
            if (is_action_schema) {
                const action = name.slice("actions_".length);
                forms.push(action);
            }
        },
    });

    if (code && is_route_schema) {
        code += constructRouteSchemaInterface(exported_schemas);
    }

    return {
        code: code,
        forms,
    };
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
