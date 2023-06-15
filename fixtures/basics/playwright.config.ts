import type { PlaywrightTestConfig } from "@playwright/test";

const use_build = process.env.CI || process.env.TEST_MODE == "build";
const config: PlaywrightTestConfig = {
	webServer: {
		command: use_build ? "npm run build && npm run preview" : "pnpm dev",
		port: use_build ? 4173 : 5173,
		stdout: "pipe"
	},
	testDir: "tests",
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

export default config;
