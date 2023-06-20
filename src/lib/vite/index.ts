import { unpluginAjvTools, type PluginOptions as AjvToolsOptions } from "ajv-build-tools";
import type { PluginOption } from "vite";
import { getRouteFormSchemasPlugin, viteSvelteFormClientGenPlugin } from "./client_gen/plugins.js";
import { typeGenPlugin } from "./types_gen/type-gen.js";
import { routeSchemasResolver } from "./helpers/resolve_route_schemas.js";
import { validateFormObjectType } from "./helpers/validate_form_schema_type.js";

interface PluginOptions {
	ajvTools?: AjvToolsOptions;
}

export function vitePluginSvelteKitva(opts?: PluginOptions) {
	const ajvTools = unpluginAjvTools.vite({
		...opts?.ajvTools,
		include: [
			"./src/routes/**/schemas.{ts,js,\\.d.ts}",
			"./src/lib/schemas/**/*.{ts,js,\\.d.ts}"
		],
		// TODO support ts to json schema
		exclude: ["**/*.d.ts"],
		plugins: [
			routeSchemasResolver(),
			typeGenPlugin(),
			validateFormObjectType(),
			getRouteFormSchemasPlugin()
		]
	});

	return [ajvTools, viteSvelteFormClientGenPlugin()] as PluginOption;
}
