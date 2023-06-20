import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { addVitePlugin } from "./edit_vite_config.js";
import { editTsConfig } from "./edit_tsconfig.js";
import { addValidationHook } from "./add_hook.js";
import { warn } from "../utils/index.js";
import { bold, green } from "kleur/colors";
import { addTypes } from "./add_types.js";
import { execSync } from "child_process";

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

interface SetupOptions {
	steps: string[];
}

export async function setup(cwd: string, { steps }: SetupOptions) {
	console.log(bold("Setting up Kitva...."));

	console.log("Running svelte-kit sync ...");
	execSync("npx svelte-kit sync");

	const r = (p: string) => resolve(cwd, p);

	const vite_config = getViteConfig(cwd);
	const is_svelte_project = existsSync(r("svelte.config.js"));
	const tsconfig_path = r("tsconfig.json");
	const jsconfig_path = r("jsconfig.json");
	const is_ts_project = existsSync(tsconfig_path);
	const is_js_project = existsSync(jsconfig_path);

	const typescript_config_path = is_ts_project ? tsconfig_path : is_js_project && jsconfig_path;
	const tsconfig = typescript_config_path && readFileSync(typescript_config_path, "utf-8");

	if (!is_svelte_project) {
		throw new Error(
			"svelte.config.js is not found. please make sure to run inside a sveltekit project"
		);
	}

	if (!vite_config) {
		throw new Error("vite.config is not found");
	}

	const ext = is_ts_project ? ".ts" : ".js";

	if (steps.includes("vite")) {
		console.log("Adding vite plugin...");
		await addVitePlugin(vite_config);
	}

	if (steps.includes("hook")) {
		console.log("Adding sveltekit hook...");
		await addValidationHook(cwd, ext);
	}

	if (tsconfig) {
		if (steps.includes("types")) {
			console.log("Editing tsconfig and app.d.ts...");
			await addTypes(cwd);

			const sk_tsconfig_path = r(".svelte-kit/tsconfig.json");
			const sk_tsconfig = readFileSync(sk_tsconfig_path, "utf-8");
			const new_tsconfig = await editTsConfig(tsconfig, sk_tsconfig);
			if (new_tsconfig) {
				writeFileSync(typescript_config_path, new_tsconfig);
			}
		}
	} else {
		warn("Could setup types because tsconfig/jsconfig is missing");
	}

	console.log(green("Setup done"));

	console.log(
		"\nIf you have any issue in setup. Please see https://github.com/qurafi/kitva/tree/master#manual-setup"
	);
}
