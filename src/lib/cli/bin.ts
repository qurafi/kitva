import { blue, bold, green, yellow } from "kleur/colors";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path, { dirname, join, resolve } from "node:path";
import { addVitePlugin } from "./edit_vite_config.js";
import { error, warn } from "$lib/shared/logger.server.js";
import { cp, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const cwd = process.cwd();

const __dirname = dirname(fileURLToPath(import.meta.url));

const template_dir = resolve(__dirname, "../../src/templates");
const init_template_dir = join(template_dir, "init");

export async function setup() {
	console.log(bold("Setting up Kitva..."));

	const vite_config = getViteConfig();

	if (!existsSync(resolve(cwd, "svelte.config.js"))) {
		return error(
			"Svelte config is not found. Please make sure to run this command inside a Sveltekit project"
		);
	}

	if (!vite_config) {
		return error("vite config is not found");
	}

	const is_typescript = existsSync(resolve(cwd, "tsconfig.json"));
	const is_jsdoc = existsSync(resolve(cwd, "jsconfig.json"));
	const ext = is_typescript ? ".ts" : ".js";
	const template_files = await getFiles(init_template_dir);
	for (const file of template_files) {
		if (!file.endsWith(ext)) {
			continue;
		}

		const relative_path = path.relative(init_template_dir, file);
		const real_path = path.resolve(cwd, relative_path);
		if (existsSync(real_path)) {
			warn(`${real_path} already exists. skipping`);
			continue;
		}
		await cp(file, real_path, { recursive: true });
	}

	console.log("Adding Vite plugin...");
	addVitePlugin(vite_config);

	if (is_typescript || is_jsdoc) {
		console.log("Setting up Typescript...");
		setupTypes();
	}
	console.log(green("Setup done"));

	console.log(yellow("\nDon't forget to install dependencies:"));
	console.log("npm i kitva ajv-formats@3.0.0-rc.0 ajv@8");

	console.log(
		blue(
			"\nIf you have any issue in setup. Please see https://github.com/qurafi/kitva/tree/master#manual-setup"
		)
	);
}

function getViteConfig() {
	const vite_js = resolve(cwd, "vite.config.js");
	if (existsSync(vite_js)) {
		return vite_js;
	}

	const vite_ts = resolve(cwd, "vite.config.ts");
	if (existsSync(vite_ts)) {
		return vite_ts;
	}
}

function setupTypes() {
	const TYPE_DEFS = `import "kitva/ambient";`;
	try {
		const app_d_ts = resolve(cwd, "src/app.d.ts");
		const content = readFileSync(app_d_ts, "utf8");
		if (!content.includes(TYPE_DEFS)) {
			writeFileSync(app_d_ts, `${TYPE_DEFS}\n${content}`);
		}
	} catch (err) {
		error("Failed to add ambient types to app.d.ts");
		console.error((err as Error).message);
	}
}

// https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
export async function getFiles(dir: string): Promise<string[]> {
	const dirents = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		dirents.map((dirent) => {
			const res = resolve(dir, dirent.name);
			return dirent.isDirectory() ? getFiles(res) : res;
		})
	);
	return files.flat();
}

try {
	await setup();
} catch (e) {
	error("Failed to setup Kitva");
	console.error(e);
}
