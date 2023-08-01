import schemas from "$schemas?t=all";
import { getValidationHook } from "kitva/server";
import { sequence } from "@sveltejs/kit/hooks";
import type { Handle } from "@sveltejs/kit";

const mainHandle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};

const validationHook = getValidationHook(schemas);
export const handle = sequence(validationHook, mainHandle);
