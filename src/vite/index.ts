import {
    unpluginAjvTools,
    type PluginOptions as AjvToolsOptions,
    type Plugin as AjvToolsPlugin,
} from "ajv-build-tools";
import type { PluginOption } from "vite";
import { resolveRoutesSchemas } from "./resolve_route_schemas.js";
import { viteSvelteFormClientGenPlugin } from "./client_gen.js";
import { typeGenPlugin } from "./type-gen.js";
import { warn } from "../utils/index.js";

interface PluginOptions {
    ajvTools?: AjvToolsOptions;
}

export function vitePluginSvelteValidation(opts: PluginOptions) {
    const ajvTools = unpluginAjvTools.vite({
        ...opts?.ajvTools,
        include: [
            "./src/routes/**/schemas.{ts,js,\\.d.ts}",
            "./src/lib/schemas/**/*.{ts,js,\\.d.ts}",
        ],
        // TODO support ts to json schema
        exclude: ["**/*.d.ts"],
        plugins: [routeSchemasResolver(), typeGenPlugin(), validateFormObjectType()],
    });

    return [ajvTools, viteSvelteFormClientGenPlugin()] as PluginOption;
}

function routeSchemasResolver(): AjvToolsPlugin {
    return {
        async resolveModule(module, file) {
            if (file.startsWith("routes/")) {
                return resolveRoutesSchemas(module, file);
            }

            return module;
        },
    };
}

function validateFormObjectType(): AjvToolsPlugin {
    return {
        onFile({ builder, relativePath }) {
            const schemas = builder.getFileJsonSchemas(relativePath);
            if (!schemas || !relativePath.startsWith("routes/")) {
                return;
            }
            for (const [name, schema] of Object.entries(schemas)) {
                if (name.startsWith("actions_") && schema.type !== "object") {
                    warn(
                        "Action schemas should be type of object, original schema",
                        schema
                    );
                }
            }
        },
    };
}
