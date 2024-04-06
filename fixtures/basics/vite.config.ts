import { vitePluginSvelteKitva } from "kitva/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 8180
	},
	preview: {
		port: 8180
	},
	build: {
		minify: false
	},
	plugins: [sveltekit() as any, vitePluginSvelteKitva()],
	resolve: {
		dedupe: ["@sveltejs/kit"]
	}
});
