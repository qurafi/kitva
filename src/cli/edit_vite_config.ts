import { readFile, writeFile } from "fs/promises";

const import_statement = "import { vitePluginSvelteValidation } from 'kitva/vite';";

export const plugin_call = `vitePluginSvelteValidation({})`;

export function editViteConfig(content: string) {
    const new_content = content.replace(/sveltekit\(\)/, (str) => {
        return `${str},${plugin_call}`;
    });
    return `${import_statement}\n${new_content}`;
}

export async function addVitePlugin(config: string) {
    const vite_config = await readFile(config, "utf-8");
    if (vite_config.includes("kitva/vite")) {
        console.log("⚠️: skipping editing vite.config");
        return;
    }

    try {
        const new_vite_config = editViteConfig(vite_config);
        if (!new_vite_config.includes(plugin_call)) {
            console.log("Could not edit vite config");
        }
        await writeFile(config, new_vite_config);
    } catch (e) {
        console.log("failed to edit vite config, rolling back");
        await writeFile(config, vite_config);
    }
}
