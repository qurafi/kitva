import type { AjvError } from "$lib/types.js";
import { json as _json } from "@sveltejs/kit";
import type { TypedResponse, TypedResponseInit } from "../fetch.js";

export function json<Data = any, Status extends number = 200>(
	data: Data,
	init?: TypedResponseInit<Status>
) {
	return _json(data, init) as TypedResponse<Data, Status>;
}

export function endpointValidationResponse(error: AjvError) {
	return {
		error: "Bad Request",
		code: "VALIDATION_ERROR",
		message: error.message
	} as const;
}

export type EndpointValidationResponse = ReturnType<typeof endpointValidationResponse>;
