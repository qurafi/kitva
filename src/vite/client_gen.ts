import { readFile } from "fs/promises";
import { dirname } from "path";
import path from "path/posix";
import { fileURLToPath } from "url";
import type { Plugin } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function viteSvelteFormClientGenPlugin(): Promise<Plugin> {
    let root: string;
    const abs_form_prefix = "$form/";
    const routes_dir = "src/routes";

    const resolved_abs_form_prefix = `\0${abs_form_prefix}`;

    return {
        name: "vite-plugin-svelte-validation",
        configResolved(config) {
            root = config.root;
        },
        resolveId(source, importer) {
            if (/^(\.\/)*\$form\//.test(source)) {
                const is_relative = source.startsWith("./");
                if (!is_relative) {
                    return `\0${source}`;
                }

                if (!importer) {
                    throw new Error(
                        "using form with relative path should have an importer"
                    );
                }

                const rel_importer = path.relative(root, importer);
                const dirname = path.dirname(rel_importer);
                if (!dirname.startsWith(routes_dir)) {
                    throw new Error(
                        "$form client could only be generated for routes schemas"
                    );
                }

                const action = source.slice(`./${abs_form_prefix}`.length);
                const route = dirname.slice(routes_dir.length);

                if (!action) {
                    throw new Error("No form action provided");
                }

                return `\0$form${route || "/"}:${action}`;
            }
        },

        async load(id) {
            if (id.startsWith(resolved_abs_form_prefix)) {
                const action_idx = id.lastIndexOf(":");
                if (action_idx < 0) {
                    throw new Error("action name is not provided");
                }
                const route = id.slice(resolved_abs_form_prefix.length, action_idx);
                const schema = `$schemas/routes/${route ? route + "/" : ""}schemas`;
                const action = id.slice(action_idx + 1);

                const code = generateClientCode(schema, action);

                return code;
            }
        },
    };
}

const client_code = await readFile(path.resolve(__dirname, "./source.js"), "utf-8");

function generateClientCode(schema_import: string, action_name: string) {
    return client_code
        .replace('"$compiled_schema$"', JSON.stringify(schema_import))
        .replace("$action_export$", "actions_" + action_name)
        .replace("$action_name$", JSON.stringify(action_name));
}
