import { warn } from "$lib/utils/server.js";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const template = `import type { RequestEvent } from "@sveltejs/kit";
import { type AjvError, getAjvLang, ajvLocales, type DefinedError } from "kitva";

/**
 * Runs on both client and server
 * Mutate the error directly (error.message = "message")
 * lang is provided by the client instance, if true provided it will be the auto detected language
 * Discard lang arg if you want to use custom language detection
 * */
export async function localize(
	lang: string,
	errors: AjvError[] | null | undefined,
	event: RequestEvent
) {
	// localize native ajv messages
	const locale = getAjvLang(lang);

	const localize = await ajvLocales[locale]();

	localize(errors?.filter((err) =>  err.keyword !== "errorMessage"));

	// your own localization logic
	if (!errors) return;

	for (const error of errors as DefinedError[]) {
		if (error.keyword == "errorMessage") {
			// custom error message
		} else {
			// ajv built-in:

			// switch (error.keyword) {
			// 	case "format":
			// 		error.message = \`must be valid \${error.params.format}\`;
			// 		break;
			// }
		}


	}
}`;

export async function add_localization(cwd: string) {
	const dir = path.resolve(cwd, "src/lib/validation");
	await mkdir(dir, { recursive: true });

	//TODO support js files
	const file = path.resolve(dir, "localization.ts");
	if (existsSync(file)) {
		warn(`Skipping ${file}, because it's already exists`);
		return;
	}

	return writeFile(file, template);
}
