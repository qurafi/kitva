import type { RequestEvent } from "@sveltejs/kit";
import type { HttpPart } from "./utils/index.js";

export type { HttpPart, HttpMethod } from "./utils/index.js";

export type JSONType = number | boolean | string | null | JSONType[] | AnyMap;

export type AnyValue = JSONType;
export type AnyMap = { [key: string]: JSONType };

/** default type for parsed request parts */
export type DefaultData = Record<HttpPart, any>;
export type AnyDefaultData = Partial<Record<HttpPart, any>>;

export type AnyError = { message: string; [key: string]: any };
export type ErrorMap = Record<string, AnyError>;

export type ValidationResult<
	Data = AnyValue,
	Error extends AnyError = AnyError,
	Both extends boolean = boolean
> =
	| {
			valid: true;
			data: Data;
			errors: undefined | null;
			input: AnyValue;
	  }
	| ({
			valid: false | undefined;
			data: undefined;

			/* parsed data when valid, could be modified by the validator e.g. assigning default or coercing types */

			/** Raw input data */
			input: AnyValue;

			errors: Error[];
	  } & { valid: Both });

export type ValidationParts<
	Data extends AnyDefaultData,
	Error extends AnyError = AnyError,
	Invalid extends boolean = boolean
> = {
	[k in keyof Data]: ValidationResult<Data[k], Error, Invalid>;
};

export type ValidationResults<
	Data extends AnyDefaultData = AnyDefaultData,
	Error extends AnyError = AnyError,
	Valid extends boolean = boolean
> = ValidationParts<Data, Error, Valid> &
	(
		| {
				valid: false;

				/**
				 * @example
				 * {
				 *  valid: false,
				 *  formErrors: {
				 *      // global error message
				 *      $$error: Error,
				 *      // field erros
				 *      user: Error,
				 *      password: Error,
				 *
				 *  }
				 * }
				 *
				 */
				formErrors?: Record<keyof Data["body"], Error>;
		  }
		| {
				valid: true;
		  }
	) & { valid: Valid };

export type AnyRequestEvent = RequestEvent<Partial<Record<string, string>>, any>;

export type EventWithValidation<V = any> = AnyRequestEvent & {
	locals: { validation: V };
};
export type AnyHandler = (event: EventWithValidation) => any;

export type RequestHandlerWithValidation<
	T extends AnyHandler,
	Data extends AnyDefaultData = any,
	Error extends AnyError = AnyError,
	Validated extends boolean = boolean
> = (event: EventWithValidation<ValidationResults<Data, Error, Validated>>) => ReturnType<T>;
