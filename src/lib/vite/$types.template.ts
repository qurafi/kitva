// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import type { AnyMap, HttpMethod, RequestHandlerWithValidation } from "../../../dist/lib/types.js";

import type { RequestHandler as RequestHandler_ } from "./$types";

import type { Schemas } from "./schema_types";

import { AjvError } from "kitva/presets/ajv/index";

export type RequestHandlers = {
	[k in HttpMethod]: k extends keyof Schemas
		? RequestHandlerWithValidation<RequestHandler_, Schemas[k], AjvError, true>
		: never;
};

export type GETHandler = RequestHandlers["GET"];
export type POSTHandler = RequestHandlers["POST"];
export type DELETEHandler = RequestHandlers["DELETE"];
export type PATCHHandler = RequestHandlers["PATCH"];
export type PUTHandler = RequestHandlers["PUT"];

type Actions_ = import("./$types").Actions;
type ActionData_ = import("./$types").ActionData;
type ActionSchemas = Schemas["actions"];
type inferAction<T> = T extends `__form_${infer R}` ? R : never;

export type Actions = {
	[k in keyof ActionSchemas]: RequestHandlerWithValidation<
		Actions_[k],
		{ body: Schemas["actions"][k] },
		AjvError,
		true
	>;
};

export type ActionData = ActionData_ & {
	[k in `__form_${keyof ActionSchemas}`]: {
		input: AnyMap;
		errors: Record<keyof ActionSchemas[inferAction<k>], AjvError>;
	};
};
