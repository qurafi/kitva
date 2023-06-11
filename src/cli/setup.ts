import { existsSync } from "fs";
import { resolve } from "path";
import { addVitePlugin } from "./edit_vite_config.js";
import { addTsRootDir } from "./edit_tsconfig.js";
import { addValidationHook } from "./add_hook.js";
import { addTypes } from "./add_types.js";
import { warn } from "../utils/index.js";
import { bold, green } from "kleur/colors";

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

export async function setup(cwd: string) {
    console.log(bold("Setting up Kitva...."));

    const r = (p: string) => resolve(cwd, p);

    const vite_config = getViteConfig(cwd);
    const is_svelte_project = existsSync(r("svelte.config.js"));
    const tsconfig_path = r("tsconfig.json");
    const jsconfig_path = r("jsconfig.json");
    const is_ts_project = existsSync(tsconfig_path);
    const is_js_project = existsSync(jsconfig_path);

    const tsconfig = is_ts_project ? tsconfig_path : is_js_project && jsconfig_path;

    if (!is_svelte_project) {
        throw new Error(
            "svelte.config.js is not found. please make sure to run inside a sveltekit project"
        );
    }

    if (!vite_config) {
        throw new Error("vite.config is not found");
    }

    const ext = is_ts_project ? ".ts" : ".js";

    await addVitePlugin(vite_config);

    await addValidationHook(cwd, ext);

    if (tsconfig) {
        // await addTypes(cwd);
        await addTsRootDir(tsconfig);
    } else {
        warn("Could not add setup types because tsconfig/jsconfig is missing");
    }

    console.log(green("Setup done"), "Make sure to install kitva package");
}
