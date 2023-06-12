import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { vitePluginSvelteValidation } from "kitva/vite";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));

export default defineConfig({
    plugins: [sveltekit(), vitePluginSvelteValidation({})],

    // optimizeDeps: {
    //     exclude: ["kitva"],
    // },

    build: {
        minify: false,
    },


});
