import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "vite";

const cwd = process.cwd();

const server = await createServer({
	root: cwd
});

await server.pluginContainer.buildStart({});

const ext = existsSync(resolve(cwd, "src/hooks.server.ts")) ? "ts" : "js";

// if hook loaded fine then the setup is correct
await server.ssrLoadModule("src/hooks.server." + ext);

process.exit(0);
