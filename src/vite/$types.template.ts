//@ts-nocheck
import type { AnyMap, DefaultData, ErrorMap, HttpMethod, ValidationResults } from "kitva/types";

import type {
	RequestEvent as RequestEvent_,
	Actions as Actions_,
	RequestHandler as RequestHandler_,
	ActionData as ActionData_
} from "./$types";

import type { Schemas } from "./schema_types";

import { AjvError } from "../lib/presets/ajv/index.js";

type ActionSchemas = Schemas["actions"];

export type RequestEvents = {
	[k in HttpMethod]: RequestEventWithValidation<Schemas[k], false>;
};

export type RequestHandlers = {
	[k in HttpMethod]: OverrideFn0Param<
		RequestHandler_,
		RequestEventWithValidation<Schemas[k], true>
	>;
};

export type GETHandler = RequestHandlers["GET"];
export type POSTHandler = RequestHandlers["POST"];
export type DELETEHandler = RequestHandlers["DELETE"];
export type PATCHHandler = RequestHandlers["PATCH"];
export type PUTHandler = RequestHandlers["PUT"];

export type Actions = {
	[k in keyof ActionSchemas]: OverrideFn0Param<
		Actions_[k],
		RequestEventWithValidation<
			{
				body: Schemas["actions"][k];
				headers: undefined;
				queries: undefined;
				params: undefined;
			},
			true
		>
	>;
};

export type ActionData = ActionData_ & {
	[k in `__form_${keyof ActionSchemas}`]: {
		input: AnyMap;
		errors: Record<keyof ActionSchemas[inferAction<k>], AjvError>;
	};
};

type RequestEventWithValidation<
	T extends DefaultData,
	Invalid extends boolean = boolean
> = RequestEvent_ & {
	locals: {
		validation: ValidationResults<T, AjvError, Invalid>;
	};
};

type OverrideFn0Param<T extends (arg0: any) => any, Overrided> = (arg0: Overrided) => ReturnType<T>;

type inferAction<T> = T extends `__form_${infer R}` ? R : never;
