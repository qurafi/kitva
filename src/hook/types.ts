import type {
	AnyError,
	AnyValue,
	HttpMethod,
	HttpPart,
	JSONType,
	ValidationResult
} from "../types.js";
import type { MaybePromise } from "../utils/index.js";
import type { Modules } from "../utils/svelte.js";

export type ValidateFn<Data = AnyValue, Error extends AnyError = AnyError> = (
	data: JSONType
) => ValidationResult<Data, Error>;

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

	/** Returns a map represet key-value pairs of form errors */
	getFormErrors: GetFormErrors;

	/** get a singular error used on standalone endpoints and global form errors */
	getError(errors: any[], part: string): AnyError;
}

export type PresetValidationOptions = Omit<ValidationOptions, "getValidation">;

export type GetValidationFunction = (
	ctx: ValidationContext
) => MaybePromise<ValidateFn | undefined>;

export type GetEndpointError = (error: any[], part: string) => Response;
export type GetFormErrors<T extends AnyError = AnyError> = (error: T[]) => Record<string, T>;
