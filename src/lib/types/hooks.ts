import type { AnyValue, ValidationResult } from "../types.js";
import type { MaybePromise } from "../shared/utils.js";
import type { Modules } from "$lib/runtime/server/utils/server.js";
import type { HttpMethod, HttpPart } from "$lib/shared/constants.js";
import type { JSONSchemaType } from "ajv";
import type { AjvError } from "$lib/runtime/ajv/index.js";
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

	/** schema.ts module corresponding to the route
	 * @example const route_schemas = await module()
	 */
	module: Modules[number];
};

export interface ValidationOptions {
	getValidation: GetValidationFunction;

	/**
	 * Format and customize the response for standalone points
	 *
	 * by default it uses the message returned by {@link getError}
	 */
	getEndpointError: GetEndpointError;

	/** get a singular error used on standalone endpoints and global form errors */
	getError(errors: AjvError[], part: string): AjvError;

	localize?: Localize;
}

export type GetValidationFunction = (
	ctx: ValidationContext
) => MaybePromise<ValidateFnCompiled | undefined>;

export type GetEndpointError = (error: AjvError[], part: string) => Response;
