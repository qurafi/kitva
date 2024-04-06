import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

const use_build = process.env.CI || process.env.TEST_MODE == "build";
const config = {
	webServer: {
		command: use_build ? "npm run build && npm run preview" : "pnpm dev",
		port: 8180,
		stdout: "pipe"
	},
	testDir: "tests",
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] }
		}
	]
} satisfies PlaywrightTestConfig;

if (use_build) {
	config.projects?.push({
		name: "firefox",
		use: { ...devices["Desktop Firefox"] }
	});
}

export default config;
