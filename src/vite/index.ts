import { unpluginAjvTools, PluginOptions as AjvToolsOptions } from "ajv-build-tools";
import { PluginOption } from "vite";
import { resolveRoutesSchemas } from "./resolve_route_schemas.js";
import { viteSvelteFormClientGenPlugin } from "./client.js";
interface PluginOptions {
    ajvTools?: AjvToolsOptions;
}

export function vitePluginSvelteValidation(opts: PluginOptions) {
    const ajvTools = unpluginAjvTools.vite({
        // TODO
        exclude: ["**/*.d.ts"],
        ...opts.ajvTools,
        include: [
            "./src/routes/**/schemas.{ts,js,\\.d.ts}",
            "./src/schemas/**/*.{ts,js,\\.d.ts}",
        ],
        async resolveModule(module, file) {
            if (file.startsWith("routes/")) {
                return resolveRoutesSchemas(module, file);
            }

            return module;
        },
    });

    return [ajvTools, viteSvelteFormClientGenPlugin()] as PluginOption;
}
