import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
    webServer: {
        command: process.env.CI ? "npm run build && npm run preview" : "pnpm dev",
        port: process.env.CI ? 4173 : 5173,
    },
    testDir: "tests",
    testMatch: /(.+\.)?(test|spec)\.[jt]s/,
};

export default config;
