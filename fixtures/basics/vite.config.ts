import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePluginSvelteKitva } from "kitva/vite";

export default defineConfig({
	plugins: [sveltekit(), vitePluginSvelteKitva()],

	build: {
		minify: false
	}
});
