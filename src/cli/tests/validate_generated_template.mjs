//@ts-nocheck
import { execSync } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";
import { cwd, stdout } from "process";
import { createServer } from "vite";

function log(...messages) {
	return console.log("\nsubprocess:", ...messages, "\n\n");
}

const project = process.cwd();

log("validating vite project setup", project);

execSync("pnpm i", {
	cwd: cwd(),
	stdio: ["ignore", "ignore", "inherit"]
});

execSync("pnpm kitva", {
	cwd: cwd(),
	stdio: ["ignore", "inherit", "inherit"]
});

const server = await createServer({
	root: cwd()
});

await server.pluginContainer.buildStart({});

const ext = existsSync(resolve(project, "src/hooks.server.ts")) ? "ts" : "js";

const mod = await server.ssrLoadModule("src/hooks.server." + ext);

process.exit(0);
