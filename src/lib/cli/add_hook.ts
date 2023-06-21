import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { warn } from "../utils/index.js";

// TODO just export the whole hook with the preset from kiva/presets/ajv
const validation_hook = `import schemas from "$schemas?t=all";

import { validationHook as getValidationHook } from "kitva/hooks";
import { createPreset } from "kitva/presets/ajv/server";

export const preset = createPreset(schemas);

export const handle = getValidationHook(preset);
`;

const hook_server_code_js = `import { handle as validationHook } from "./lib/validation/hook";
import { sequence } from "@sveltejs/kit/hooks";

/** @type {import("@sveltejs/kit").Handle} */
const mainHandle = async ({event, resolve}) => {
    // main hook
    return resolve(event);
}

export const handle = sequence(validationHook, mainHandle)`;

const hook_server_code_ts = `import type { Handle } from "@sveltejs/kit";\n
import { handle as validationHook } from "./lib/validation/hook";
import { sequence } from "@sveltejs/kit/hooks";

const mainHandle: Handle = async ({event, resolve}) => {
    return resolve(event);
}

export const handle = sequence(validationHook, mainHandle)`;
export async function addValidationHook(cwd: string, ext: string) {
	const lib_dir = resolve(cwd, "./src/lib/validation");
	await mkdir(lib_dir, { recursive: true });

	// add hook preset to the $lib/validation
	const lib_hook = resolve(lib_dir, "hook" + ext);
	if (!checkAlreadySetup(cwd, lib_hook, validation_hook)) {
		await writeFile(lib_hook, validation_hook);
	}

	// hooks.server
	const hooks_server = resolve(cwd, "src/hooks.server" + ext);
	if (!checkAlreadySetup(cwd, hooks_server, "$lib/validation/hook")) {
		const content = ext == ".ts" ? hook_server_code_ts : hook_server_code_js;

		await writeFile(hooks_server, content);
	}
}

function checkAlreadySetup(cwd: string, file: string, expected_content: string) {
	if (existsSync(file)) {
		const content = readFileSync(file, "utf-8");
		const rel_path = relative(cwd, file);
		if (content.includes(expected_content)) {
			warn(`Skipping ${rel_path} because it's already setup`);
		} else {
			warn(
				`Could not create ${rel_path} because it's already exists. You may need to manually setup the file`
			);
		}
		return true;
	}
}
