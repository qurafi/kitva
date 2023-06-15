import { dirname } from "path";
import path from "path/posix";
import type { Plugin as VitePlugin } from "vite";
import type { Plugin as ajvToolsPlugin } from "ajv-build-tools";
import { generateClientCode } from "../typegen/form.js";

export async function viteSvelteFormClientGenPlugin(): Promise<VitePlugin> {
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
			const is_relative = source.startsWith("./$form");
			if (is_relative || source.startsWith("$form/")) {
				if (!is_relative) {
					return `\0${source}`;
				}

				if (!importer) {
					throw new Error("using form with relative path should have an importer");
				}

				const rel_importer = path.relative(root, importer);
				const dirname = path.dirname(rel_importer);
				if (!dirname.startsWith(routes_dir)) {
					throw new Error("$form client could only be generated for routes schemas");
				}

				const route = dirname.slice(routes_dir.length);

				return `\0$form${route || "/"}`;
			}
		},

		async load(id) {
			if (id.startsWith(resolved_abs_form_prefix)) {
				const route = id.slice(resolved_abs_form_prefix.length);
				const schema = `$schemas/routes/${route ? route + "/" : ""}schemas`;
				const route_action_names = routes_form["routes/" + route];
				if (!route_action_names) {
					throw new Error("Could not find actions for this route");
				}
				// console.log(route, routes_form, route_action_names);

				const code = generateClientCode(schema, route_action_names);

				return code;
			}
		}
	};
}
export const routes_form: Record<string, string[]> = {};

export function getRouteFormSchemaPlugin(): ajvToolsPlugin {
	return {
		onFile({ builder, relativePath }) {
			if (relativePath.startsWith("routes/")) {
				const file_schemas = builder.getFileJsonSchemas(relativePath, true);
				if (file_schemas) {
					routes_form[dirname(relativePath)] = Object.keys(file_schemas)
						.filter((name) => name.startsWith("actions_"))
						.map((name) => name.slice("actions_".length));
				}
			}
		}
	};
}
