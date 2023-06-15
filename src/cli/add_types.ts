import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";

const type_defs = `import "kitva/ambient";`;

const locals_def = 'validation: import("kitva/presets/ajv/index").AppLocal';

export async function addTypes(cwd: string) {
	const app_d_ts = resolve(cwd, "src/app.d.ts");
	const content = await readFile(app_d_ts, "utf8");

	return writeFile(app_d_ts, editAppDts(content));
}

export function editAppDts(content: string) {
	let new_content = content;
	if (!content.includes(type_defs)) {
		new_content = `${type_defs}\n${content}`;
	}

	// this will be handled by a vite plugin to generate $types2 with all locals type setup to each route
	// if (!content.includes(locals_def)) {
	//     new_content = new_content.replace(
	//         /(\/\/)* (interface Locals {)/,
	//         (_, __, intrfc) => {
	//             return `${intrfc}\n\t${locals_def};\n\t`;
	//         }
	//     );
	// }

	return new_content;
}
