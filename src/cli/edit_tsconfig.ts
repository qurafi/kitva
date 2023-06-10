import { readFile, writeFile } from "fs/promises";
import { warn } from "../utils/index.js";

const root_dirs = [".svelte-kit/types", ".schemas/types", "."];

function loadTsconfig(content: string) {
    if (content == "") return;
    try {
        return (0, eval)(`(${content})`);
    } catch (e) {
        return;
    }
}

const rootDir_key = '"rootDirs":';

export function editTsConfig(content: string) {
    const rootDirs_idx = content.indexOf(rootDir_key);
    if (rootDirs_idx >= 0) {
        return mergeRootDirs(content, rootDirs_idx);
    }

    const new_content = content.replace(/"compilerOptions": {([^"]*)/, (str, indent) => {
        return `${str}"rootDirs": ${JSON.stringify(root_dirs)},${indent}`;
    });

    if (!loadTsconfig(new_content)) {
        return content;
    }

    return new_content;
}

function mergeRootDirs(content: string, idx: number) {
    try {
        const rootDirs_json = content.slice(
            idx + rootDir_key.length,
            content.indexOf("]") + 1
        );
        const parsed = JSON.parse(rootDirs_json);
        const merged = [...new Set([...parsed, ...root_dirs])];
        return content.replace(rootDirs_json, JSON.stringify(merged));
    } catch (e) {
        return content;
    }
}

export async function addTsRootDir(config_path: string) {
    const content = await readFile(config_path, "utf-8");
    const tsconfig = loadTsconfig(content);
    if (!tsconfig) {
        throw new Error("invalid tsconfig syntax");
    }

    if (tsconfig?.compilerOptions?.rootDirs?.includes(".schemas/types")) {
        warn("Skipping adding rootDirs to tsconfig/jsconfig");
        return;
    }

    const new_content = editTsConfig(content);
    return writeFile(config_path, new_content);
}
