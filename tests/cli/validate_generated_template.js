import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "vite";

const cwd = process.cwd();

log("validating vite project setup", cwd);

install();

execSync("pnpm kitva -y", {
	cwd: cwd,
	stdio: ["inherit", "inherit", "inherit"]
});

const server = await createServer({
	root: cwd
});

await server.pluginContainer.buildStart({});

const ext = existsSync(resolve(cwd, "src/hooks.server.ts")) ? "ts" : "js";

// if hook loaded fine then the setup is correct
await server.ssrLoadModule("src/hooks.server." + ext);

process.exit(0);

function log(...messages) {
	return console.log("\nsubprocess:", ...messages, "\n\n");
}

function install() {
	execSync("pnpm i --ignore-workspace", {
		cwd,
		stdio: ["ignore", "ignore", "inherit"]
	});
}
