import { readFileSync, writeFileSync } from "fs";
import { warn } from "$lib/shared/logger.server.js";
import { dim } from "kleur/colors";

const plugin_fn = "vitePluginSvelteKitva";
const import_statement = `import { ${plugin_fn} } from 'kitva/vite';`;

const plugin_call = `${plugin_fn}()`;

export function editViteConfig(content: string) {
	const new_content = content.replace(/sveltekit\(\)/, (str) => {
		return `${str},${plugin_call}`;
	});
	return `${import_statement}\n${new_content}`;
}

export function addVitePlugin(config: string) {
	const vite_config = readFileSync(config, "utf-8");
	if (vite_config.includes("kitva/vite")) {
		warn("Skipping modifying vite.config. plugin already added");
		return;
	}

	const new_vite_config = editViteConfig(vite_config);
	if (!new_vite_config.includes(plugin_call)) {
		warn("Could not edit Vite config. code to add:");
		console.log(`\t${dim(`${import_statement}\n\t${dim(plugin_call)} // into vite plugins`)}`);
		return;
	}
	writeFileSync(config, new_vite_config);
}
