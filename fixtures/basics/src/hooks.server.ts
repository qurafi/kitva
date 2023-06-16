import type { Handle } from "@sveltejs/kit";

import { handle as validationHook } from "$lib/validation/hook";
import { sequence } from "@sveltejs/kit/hooks";

const mainHandle: Handle = async ({event, resolve}) => {
    return resolve(event);
}

export const handle = sequence(validationHook, mainHandle)