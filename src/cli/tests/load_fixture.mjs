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

execSync("pnpm --ignore-workspace i", {
    cwd: cwd(),
    stdio: ["ignore", "ignore", "inherit"],
});

const server = await createServer({
    root: cwd(),
});

await server.pluginContainer.buildStart({});

const ext = existsSync(resolve(project, "src/hook.server.ts")) ? "ts" : "js";

const mod = await server.ssrLoadModule("src/hook.server." + ext);

log("before exit");

process.exit(0);
