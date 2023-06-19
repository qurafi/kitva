import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		// singleThread: true,
		threads: true,
		include: ["src/**/*.{test,spec}.{js,ts}"]
	}
});
