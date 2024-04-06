import type { AnyValue, ValidationResult } from "../types.js";
import type { Modules } from "$lib/runtime/server/utils/server.js";
import type { HttpMethod, HttpPart } from "$lib/shared/constants.js";
import type { JSONSchemaType } from "ajv";
import type { Localize } from "$lib/runtime/ajv/localization.js";

export type ValidateFnCompiled<Data = AnyValue> = {
	(data: unknown): ValidationResult<Data>;
	schema: JSONSchemaType<Data>;
};

type ActionValidationContext = {
	isEndpoint: false;
	action: string;
};

type EndpointValidationContext = {
	isEndpoint: true;
	method: HttpMethod;
	part: HttpPart;
};

export type ValidationContext = (ActionValidationContext | EndpointValidationContext) & {
	routeId: string;

	module: Modules[number];
};

export interface ValidationOptions {
	localize?: Localize;
}
