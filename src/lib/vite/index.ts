import { unpluginAjvTools, type PluginOptions as AjvToolsOptions } from "ajv-build-tools";
import type { PluginOption } from "vite";
import { getRouteFormSchemasPlugin, viteSvelteFormClientGenPlugin } from "./client_gen/plugins.js";
import { typeGenPlugin } from "./types_gen/type-gen.js";
import { routeSchemasResolver } from "./helpers/resolve_route_schemas.js";
import { resolveFormObjectType } from "./helpers/resolve_form_schema_type.js";

interface PluginOptions {
	ajvTools?: AjvToolsOptions;
}

export function vitePluginSvelteKitva(opts?: PluginOptions) {
	const ajvTools = unpluginAjvTools.vite({
		...opts?.ajvTools,
		include: [
			"./src/routes/**/schemas.{ts,js,\\.d.ts}",
			"./src/lib/schemas/**/*.{ts,js,\\.d.ts}",
			...(opts?.ajvTools?.include || [])
		],
		exclude: ["**/*.d.ts", ...(opts?.ajvTools?.exclude || [])],
		plugins: [
			routeSchemasResolver(),
			getRouteFormSchemasPlugin(),
			...(opts?.ajvTools?.plugins || []),
			resolveFormObjectType(),
			typeGenPlugin()
		]
	});

	return [ajvTools as PluginOption, viteSvelteFormClientGenPlugin()];
}
