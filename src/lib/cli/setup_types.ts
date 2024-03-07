import { error } from "$lib/runtime/server/utils/server.js";
import { TYPES_ROOT_DIR } from "$lib/compile/vite/types_gen/type-gen.js";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const type_defs = `import "kitva/ambient";`;

const ROOT_DIR = TYPES_ROOT_DIR.replace(".svelte-kit/", "");

const svelte_config_typescript = `

// Added by Kitva
const typescript = (config.kit.typescript ??= {});
const set_config = typescript.config;

typescript.config = function (config) {
    (config.compilerOptions.rootDirs ??= []).push("${ROOT_DIR}");
    config.include.push("${ROOT_DIR}");
    return set_config?.(config);
};`;

export function setupTypes(cwd: string) {
	try {
		const app_d_ts = resolve(cwd, "src/app.d.ts");
		const content = readFileSync(app_d_ts, "utf8");
		if (!content.includes(type_defs)) {
			writeFileSync(app_d_ts, `${type_defs}\n${content}`);
		}
	} catch (err) {
		error("Failed to add ambient types to app.d.ts");
		console.error(err);
	}

	const svelte_config_path = resolve(cwd, "svelte.config.js");
	const svelte_config_content = readFileSync(svelte_config_path, "utf8");
	if (!svelte_config_content.includes(svelte_config_typescript)) {
		appendFileSync(svelte_config_path, svelte_config_typescript);
	}
}
