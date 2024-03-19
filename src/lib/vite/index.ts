import { unpluginAjvTools, type PluginOptions as AjvToolsOptions } from "ajv-build-tools";
import type { Plugin } from "vite";
import { typeGenPlugin } from "./codegen/index.js";
import { routeSchemasResolver, resolveZodSchemas, resolveLibSchemas } from "./resolvers.js";

interface PluginOptions {
	ajvTools?: Partial<AjvToolsOptions>;
}

export function vitePluginSvelteKitva(opts?: PluginOptions): Plugin[] {
	const ajvTools = unpluginAjvTools.vite({
		...opts?.ajvTools,
		ajvOptions: {
			all: {
				coerceTypes: "array"
			},
			...opts?.ajvTools?.ajvOptions
		},
		include: [
			"./src/routes/**/schemas.{ts,js,\\.d.ts}",
			"./src/lib/schemas/**/*.{ts,js,\\.d.ts}",
			...(opts?.ajvTools?.include || [])
		],
		exclude: ["**/*.d.ts", "src/lib/schemas/*.out.ts", ...(opts?.ajvTools?.exclude || [])],
		plugins: [
			routeSchemasResolver(),
			resolveZodSchemas(),
			resolveLibSchemas(),
			...(opts?.ajvTools?.plugins || []),
			typeGenPlugin()
		]
	});

	return [ajvTools].flat();
}
