import { sequence } from "@sveltejs/kit/hooks";
import { localize } from "$lib/validation/localization";
import type { Handle } from "@sveltejs/kit";
import { validationHook } from "kitva/server";

const mainHandle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};

export const handle = sequence(validationHook({ localize }), mainHandle);
