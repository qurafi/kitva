import { unpluginAjvTools, type PluginOptions as AjvToolsOptions } from "ajv-build-tools";
import type { PluginOption } from "vite";
import { resolveRoutesSchemas } from "./resolve_route_schemas.js";
import { viteSvelteFormClientGenPlugin } from "./client_gen.js";

interface PluginOptions {
    ajvTools?: AjvToolsOptions;
}

export function vitePluginSvelteValidation(opts: PluginOptions) {
    const ajvTools = unpluginAjvTools.vite({
        ...opts.ajvTools,
        include: [
            "./src/routes/**/schemas.{ts,js,\\.d.ts}",
            "./src/lib/schemas/**/*.{ts,js,\\.d.ts}",
        ],
        // TODO support ts to json schema
        exclude: ["**/*.d.ts"],
        async resolveModule(module, file) {
            if (file.startsWith("routes/")) {
                return resolveRoutesSchemas(module, file);
            }

            return module;
        },
    });

    return [ajvTools, viteSvelteFormClientGenPlugin()] as PluginOption;
}
