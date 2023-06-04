import { HttpPart } from "./utils/index.js";

export type JSONType = boolean | number | string | null | JSONType[] | AnyMap;

export type AnyValue = JSONType;
export type AnyMap = { [key: string]: JSONType };

/** default type for parsed request parts */
export type DefaultData = Record<HttpPart, any>;

export type AnyError = { message: string; [key: string]: any };
export type ErrorMap = Record<string, AnyError>;

export type ValidationResult<Data = AnyValue, Error extends AnyError = AnyError> =
    | {
          valid: true;
          data: Data;
          errors: undefined | null;
          input: AnyValue;
      }
    | {
          valid: false | undefined;
          data: undefined;

          /* parsed data when valid, could be modified by the validator e.g. assigning default or coercing types */

          /** Raw input data */
          input: AnyValue;

          errors: Error[];
      };

export type ValidationParts<Data extends DefaultData> = {
    [k in keyof Data]: ValidationResult<Data[k]>;
};

export type ValidationResults<
    Data extends DefaultData = DefaultData,
    Error = AnyError
> = ValidationParts<Data> & {
    valid: boolean;

    /**
     *
     * params, headers, queries validated first
     * and if there's errors, the first error will be assigned
     * with globalError symbol
     *
     * for body(form inputs). errors assigned by fields.
     *
     * @example
     * {
     *  valid: false,
     *  formErrors: {
     *      // for params, headers, querystring, or global errors
     *      // first error only
     *      $$error: Error,
     *
     *      // for body(form inputs) it's assigned by field
     *      user: Error,
     *      password: Error,
     *
     *  }
     * }
     *
     */
    formErrors?: Record<string, Error>;
};
