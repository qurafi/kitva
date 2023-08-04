import { blue, bold, green, yellow } from "kleur/colors";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { addValidationHook } from "./add_hook.js";
import { addVitePlugin } from "./edit_vite_config.js";
import { setupTypes } from "./setup_types.js";
import { addDeps } from "./add_deps.js";
import { add_localization } from "./add_localization.js";

interface SetupOptions {
	steps: string[];
}

export async function setup(cwd: string, { steps }: SetupOptions) {
	console.log(bold("Setting up Kitva..."));

	const vite_config = getViteConfig(cwd);

	const has_tsconfig = existsSync(resolve(cwd, "tsconfig.json"));

	if (!existsSync(resolve(cwd, "svelte.config.js"))) {
		throw new Error(
			"svelte.config.js is not found. please make sure to run this command inside a sveltekit project"
		);
	}

	if (!vite_config) {
		throw new Error("vite config is not found");
	}

	if (steps.includes("vite")) {
		console.log("Adding Vite plugin...");
		addVitePlugin(vite_config);
	}

	if (steps.includes("hook")) {
		console.log("Adding SvelteKit hook...");
		addValidationHook(cwd, has_tsconfig ? ".ts" : ".js");
	}

	if (steps.includes("types")) {
		console.log("Setting up Typescript...");
		setupTypes(cwd);
	}

	if (steps.includes("deps")) {
		console.log("Adding runtime dependencies");
		addDeps(cwd);
	}

	if (steps.includes("localize")) {
		console.log("Adding localization file");
		await add_localization(cwd);
	}

	console.log(green("Setup done"));

	console.log(yellow("\nDon't forget to install dependencies:"));

	console.log("pnpm i\nnpm i");

	console.log(
		blue(
			"\nIf you have any issue in setup. Please see https://github.com/qurafi/kitva/tree/master#manual-setup"
		)
	);
}

function getViteConfig(cwd: string) {
	const vite_js = resolve(cwd, "vite.config.js");
	if (existsSync(vite_js)) {
		return vite_js;
	}

	const vite_ts = resolve(cwd, "vite.config.ts");
	if (existsSync(vite_ts)) {
		return vite_ts;
	}
}
