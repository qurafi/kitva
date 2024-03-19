import type { HttpMethod, HttpPart } from "$lib/shared/constants.js";
import type { AjvError } from "./runtime/ajv/index.js";
import type { AnyHandler, RequestHandlerWithValidation, AnyActions } from "./types.js";

export type { FormResult, FormResults } from "./types/forms.js";
export type { AjvError, HttpMethod, HttpPart, RequestHandlerWithValidation };

export { defineGenerated } from "./runtime/client/client.js";
export { withValidation } from "./runtime/server/forms.js";

export type RouteSchemas = Partial<Record<HttpMethod, Partial<Record<HttpPart, any>>>> & {
	actions?: Record<string, any>;
};

export type RewriteHandlers<Schemas extends RouteSchemas, Handler extends AnyHandler> = {
	[k in HttpMethod]: k extends keyof Schemas
		? Schemas[k] extends NonNullable<unknown>
			? RequestHandlerWithValidation<Handler, Schemas[k], true>
			: never
		: never;
};

export type RewriteActions<ActionsData extends Record<string, any>, Handlers extends AnyActions> = {
	[k in keyof ActionsData]: RequestHandlerWithValidation<
		Handlers[k & keyof Handlers],
		{ body: ActionsData[k] },
		true,
		k & string
	>;
};
