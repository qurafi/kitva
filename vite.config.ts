import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [sveltekit()],
	clearScreen: false,
	test: {
		typecheck: {
			include: ["fixtures/basics/src/**/*.test-d.ts"]
		},
		include: ["{src,tests}/**/*.{test,spec}.{js,ts}"],
		watchExclude: ["tests/cli/fixtures/**", "**/node_modules/**, **/dist/**"]
	}
});
