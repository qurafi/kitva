import { vitePluginSvelteKitva } from "kitva/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [sveltekit() as any, vitePluginSvelteKitva()]
});
