import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { vitePluginSvelteValidation } from "kitva/vite";
import Inspect from "vite-plugin-inspect";

export default defineConfig({
    plugins: [sveltekit(), vitePluginSvelteValidation({})],

    // optimizeDeps: {
    //     exclude: ["kitva"],
    // },
});
