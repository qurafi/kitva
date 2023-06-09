import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // singleThread: true,
        threads: true,
        include: ["{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    },
});
