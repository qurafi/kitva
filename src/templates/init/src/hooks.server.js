import schemas from "$schemas?t=all";
import { getValidationHook } from "kitva/server";
import { sequence } from "@sveltejs/kit/hooks";
import { localize } from "./lib/validation/localization.js";

/** @type {import("@sveltejs/kit").Handle} */
const mainHandle = async ({ event, resolve }) => {
	return resolve(event);
};

const validationHook = getValidationHook(schemas, { localize });
export const handle = sequence(validationHook, mainHandle);
