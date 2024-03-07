import { readFileSync, writeFileSync } from "fs";
import { warn } from "../runtime/server/utils/server.js";

const import_statement = "import { vitePluginSvelteKitva } from 'kitva/vite';";

export const plugin_call = `vitePluginSvelteKitva()`;

export function editViteConfig(content: string) {
	const new_content = content.replace(/sveltekit\(\)/, (str) => {
		return `${str},${plugin_call}`;
	});
	return `${import_statement}\n${new_content}`;
}

export function addVitePlugin(config: string) {
	const vite_config = readFileSync(config, "utf-8");
	if (vite_config.includes("kitva/vite")) {
		warn("Skipping editing vite.config");
		return;
	}

	const new_vite_config = editViteConfig(vite_config);
	if (!new_vite_config.includes(plugin_call)) {
		warn("Could not edit vite config");
	}
	writeFileSync(config, new_vite_config);
}
