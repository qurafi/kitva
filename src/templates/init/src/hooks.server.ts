import { validationHook } from "kitva/server";
import { sequence } from "@sveltejs/kit/hooks";
import { localize } from "./lib/validation/localization.js";
import type { Handle } from "@sveltejs/kit";

const mainHandle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};

const handleValidation = validationHook({ localize });
export const handle = sequence(handleValidation, mainHandle);
