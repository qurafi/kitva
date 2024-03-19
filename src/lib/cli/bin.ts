import { blue, bold, green, yellow, dim, red } from "kleur/colors";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path, { dirname, join, resolve } from "node:path";
import { addVitePlugin } from "./edit_vite_config.js";
import { error, warn } from "$lib/shared/logger.server.js";
import { cp, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import readline from "readline";

const cwd = process.cwd();

const __dirname = dirname(fileURLToPath(import.meta.url));

const template_dir = resolve(__dirname, "../../src/templates");
const init_template_dir = join(template_dir, "init");

const confirmed = process.argv.includes("-y");

export async function setup() {
	const should_run = confirmed || (await confirmRun());
	if (!should_run) {
		console.log("Aborted");
		return;
	}

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
	const skipped: string[] = [];
	for (const file of template_files) {
		if (!file.endsWith(ext)) {
			continue;
		}

		const relative_path = path.relative(init_template_dir, file);
		const real_path = path.resolve(cwd, relative_path);
		if (existsSync(real_path)) {
			skipped.push(relative_path);
			continue;
		}
		await cp(file, real_path, { recursive: true });
	}

	const skipped_files = skipped.join(", ");
	warn(
		`Skipping. File ${bold(
			dim(skipped_files)
		)} already exists, you may need to configure this file manually`
	);

	addVitePlugin(vite_config);

	if (is_typescript || is_jsdoc) {
		setupTypes();
	} else {
		warn(
			"No tsconfig or jsconfig detected. It's recommended to use typescript or type checked javascript"
		);
	}

	console.log(green("\nSetup done"));

	console.log(
		"\nIf you have any issue in setup. Please refer to",
		blue("https://github.com/qurafi/kitva/tree/master#manual-setup")
	);
}

const confirm_text = `${bold("This will edit")}:
    app.d.ts (add ambient types)
    vite.config (add vite plugin)

${bold("Reserved paths:")}
    $lib/validation (configuration)
    $lib/schemas (shared schemas)

${bold(yellow("Are you sure you want to run this script?"))} (y/N)`;

async function confirmRun() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	return new Promise<boolean>((resolve) => {
		rl.question(confirm_text, (answer) => {
			const length = confirm_text.split("\n").length;
			readline.moveCursor(process.stdout, 0, -length);
			readline.clearScreenDown(process.stdout);
			rl.close();
			resolve(answer.trim().toLowerCase() === "y");
		});
	});
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
