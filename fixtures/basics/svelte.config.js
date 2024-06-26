import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;

// Added by Kitva
const typescript = (config.kit.typescript ??= {});
const set_config = typescript.config;

typescript.config = function (config) {
	const rootDir = "kitva-schemas/types";
	(config.compilerOptions.rootDirs ??= []).push(rootDir);
	config.include.push(rootDir);
	return set_config?.(config);
};
