import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { warn } from "../utils/server.js";

export function hook_template(is_ts: boolean) {
	const code = [
		'import schemas from "$schemas?t=all"',
		'import { getValidationHook } from "kitva/server"',
		'import { sequence } from "@sveltejs/kit/hooks"'
	];

	if (is_ts) {
		code.push('import type { Handle } from "@sveltejs/kit";');
	}

	code.push("\n");

	if (!is_ts) {
		code.push(`/** @type {import("@sveltejs/kit").Handle} */`);
	}

	code.push(
		`const mainHandle${is_ts ? ": Handle" : ""} = async ({event, resolve}) => {`,
		`\treturn resolve(event);`,
		`};`
	);

	code.push(
		`\nconst validationHook = getValidationHook(schemas)`,
		`export const handle = sequence(validationHook, mainHandle)`
	);

	return code.join("\n");
}

export function addValidationHook(cwd: string, ext: string) {
	const hooks_server = resolve(cwd, "src/hooks.server" + ext);

	const code = hook_template(ext == ".ts");

	if (existsSync(hooks_server)) {
		const content = readFileSync(hooks_server, "utf-8");
		if (content.includes(code)) {
			warn(`Skipping hook.server file because it's already setup`);
		} else {
			warn(`Could not create hook.server file because it's already exists.`);
			console.log("\nTry to setup the validation hook manually:");
			console.log(code, "\n");
		}
		return;
	}
	writeFileSync(hooks_server, code);
}
