import { validationHook } from "kitva/server";
import { sequence } from "@sveltejs/kit/hooks";
import { localize } from "./lib/validation/localization.js";

/** @type {import("@sveltejs/kit").Handle} */
const mainHandle = async ({ event, resolve }) => {
	return resolve(event);
};

const handleValidation = validationHook({ localize });
export const handle = sequence(handleValidation, mainHandle);
