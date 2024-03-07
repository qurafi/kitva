// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import type { RequestHandlerWithValidation, HttpMethod } from "kitva/types";

import type { Schemas } from "./schema_types.js";

import { AjvError } from "kitva";

import type { RequestEvent } from "@sveltejs/kit";
import type { RouteParams, RouteId } from "./$types.js";
import { FormResult } from "kitva/server";

export type RequestHandlers = {
	[k in HttpMethod]: k extends keyof Schemas
		? RequestHandlerWithValidation<
				(event: CurrentRequestEvent) => any,
				Schemas[k],
				AjvError,
				true
		  >
		: never;
};

export type GETHandler = RequestHandlers["GET"];
export type POSTHandler = RequestHandlers["POST"];
export type DELETEHandler = RequestHandlers["DELETE"];
export type PATCHHandler = RequestHandlers["PATCH"];
export type PUTHandler = RequestHandlers["PUT"];

type ActionSchemas = Schemas["actions"];

type CurrentRequestEvent = RequestEvent<RouteParams, RouteId>;

export type Actions = {
	[k in keyof ActionSchemas]: RequestHandlerWithValidation<
		(event: CurrentRequestEvent) => any,
		{ body: Schemas["actions"][k] },
		AjvError,
		true,
		k
	>;
};

export const withValidation: <T extends Actions>(
	actions: T
) => {
	[K in keyof T]: (
		event: CurrentRequestEvent
	) => { action: K } & (Awaited<ReturnType<T[K]>> | FormResult<K>);
};
