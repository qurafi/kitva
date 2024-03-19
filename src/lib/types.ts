import type { RequestEvent } from "@sveltejs/kit";

import type { HttpPart } from "./shared/constants.js";
import type { AjvError } from "./index.js";
import type { GLOBAL_ERROR } from "./runtime/ajv/index.js";
import type { Localize } from "./runtime/ajv/localization.js";

export type JSONType = number | boolean | string | null | JSONType[] | AnyMap;

export type AnyValue = JSONType;
export type AnyMap = { [key: string]: JSONType };

/** default type for parsed request parts */
export type DefaultData = Record<HttpPart, any>;
export type AnyDefaultData = Partial<Record<HttpPart, any>>;

export type ErrorMap = Record<string, AjvError | null | undefined>;

export type ValidationResult<Data = AnyValue, Both extends boolean = boolean> =
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

			errors: AjvError[];
	  } & { valid: Both });

export type ValidationParts<Data extends AnyDefaultData, Invalid extends boolean = boolean> = {
	[k in keyof Data]: ValidationResult<Data[k], Invalid>;
};

//TODO set it to non nullable when used with forms
type WithFormErrors<Data extends AnyMap> = {
	formErrors?: Partial<Record<keyof Data | typeof GLOBAL_ERROR, AjvError | null>>;
};

export type ValidationResults<
	Data extends AnyDefaultData = AnyDefaultData,
	Valid extends boolean = boolean
> = { localize?: Localize } & ValidationParts<Data, Valid> &
	WithFormErrors<Data["body"]> & { valid: Valid };

export type AnyRequestEvent = RequestEvent<Partial<Record<string, string>>, any>;

export type EventWithValidation<
	Data extends AnyDefaultData = any,
	Validated extends boolean = boolean,
	ActionName extends string | undefined = undefined,
	Event extends AnyRequestEvent = AnyRequestEvent
> = Event & {
	locals: { validation: ValidationResults<Data, Validated>; action: ActionName };
};

export type AnyHandler = (event: AnyRequestEvent) => any;

export type AnyActions = Record<string, AnyHandler>;

export type RequestHandlerWithValidation<
	T extends AnyHandler,
	Data extends AnyDefaultData = any,
	Validated extends boolean = boolean,
	ActionName extends string | undefined = undefined
> = (event: EventWithValidation<Data, Validated, ActionName, Parameters<T>["0"]>) => ReturnType<T>;
