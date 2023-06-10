import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { resolve } from "path";
import { error } from "../utils/index.js";

// TODO just export the whole hook with the preset from kiva/presets/ajv
const validation_hook = `import schemas from "$schemas?t=all";

import { validationHook as getValidationHook } from "kitva/hook/index";
import { createPreset } from "kitva/presets/ajv/server";

export const preset = createPreset(schemas);

export const handle = getValidationHook(preset);
`;

const hook_server_code_js = `import { handle as validationHook } from "$lib/validation/hook";
import { sequence } from "@sveltejs/kit/hooks";

/** @type {import("@sveltejs/kit").Handle} */
const mainHandle = async ({event, resolve}) => {
    // main hook
    return resolve(event);
}

export const handle = sequence(validationHook, mainHandle)`;

const hook_server_code_ts = `import type { Handle } from "@sveltejs/kit";\n
import { handle as validationHook } from "$lib/validation/hook";
import { sequence } from "@sveltejs/kit/hooks";

const mainHandle: Handle = async ({event, resolve}) => {
    return resolve(event);
}

export const handle = sequence(validationHook, mainHandle)`;
export async function addValidationHook(cwd: string, ext: string) {
    const lib_dir = resolve(cwd, "./src/lib/validation");
    await mkdir(lib_dir, { recursive: true });

    //TODO add ambient types

    // add hook preset to the $lib/validation
    await writeFile(resolve(lib_dir, "hook" + ext), validation_hook);

    // hook.server
    const hook_server = resolve(cwd, "src/hook.server" + ext);
    if (existsSync(hook_server)) {
        error(
            "Could not create hook.server.ts because it's already exists. Manual setup is required"
        );
        return;
    }

    const content = ext == ".ts" ? hook_server_code_ts : hook_server_code_js;

    await writeFile(hook_server, content);
}
