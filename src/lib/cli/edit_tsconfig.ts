import * as jsonc from "jsonc-parser";
import { red } from "kleur/colors";
import { error, warn } from "../utils/index.js";
import path from "path";

const root_dir = ".schemas/types";

export async function editTsConfig(tsconfig: string, sk_tsconfig: string) {
	const sk_config = parseJsonc(sk_tsconfig);
	const tsconfig_parsed = parseJsonc(tsconfig);
	if (!sk_config || !tsconfig_parsed) {
		warn("skipping due to invalid tsconfig");
		return;
	}

	const sk_include = sk_config.include.map((p: string) => {
		return path.join(".svelte-kit", p);
	});

	const include_new = tsconfig_parsed.include || sk_include;
	if (!include_new.includes(root_dir)) {
		include_new.push(root_dir);
	}

	let new_tsconfig = jsonc.applyEdits(
		tsconfig,
		jsonc.modify(tsconfig, ["include"], include_new, {
			formattingOptions: {
				insertSpaces: true,
				keepLines: true
			}
		})
	);

	const sk_root_dirs = sk_config.compilerOptions.rootDirs.map((p: string) => {
		return path.join(".svelte-kit", p);
	});

	const rootDirs = tsconfig_parsed.compilerOptions?.rootDirs || sk_root_dirs;
	if (!rootDirs.includes(root_dir)) {
		rootDirs.push(root_dir);
	}

	new_tsconfig = jsonc.applyEdits(
		new_tsconfig,
		jsonc.modify(new_tsconfig, ["compilerOptions", "rootDirs"], rootDirs, {
			formattingOptions: {
				insertSpaces: true,
				keepLines: true
			}
		})
	);

	return new_tsconfig;
}

function printParseError(text: string, err: jsonc.ParseError) {
	const text_start = text.slice(err.offset - 100, err.offset);
	const text_end = text.slice(err.offset, Math.min(text.length, err.offset + err.length + 50));
	return `${text_start}<${red(jsonc.printParseErrorCode(err.error))}>${text_end}`;
}

function parseJsonc(content: string) {
	const errors: jsonc.ParseError[] = [];
	const parsed = jsonc.parse(content, errors, {
		allowTrailingComma: true,
		allowEmptyContent: false
	});
	if (errors.length) {
		error("invalid config", printParseError(content, errors[0]));
		return;
	}
	return parsed;
}
