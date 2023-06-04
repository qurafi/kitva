import { bold, yellow } from "kleur/colors";
import createDebugger from "debug";

export type AnyMap = Record<string, any>;
export type MaybePromise<T> = Promise<T> | T;
export type HttPMethod = (typeof HTTP_METHODS)[number];
export type HttpPart = (typeof HTTP_PARTS)[number];

export const HTTP_METHODS = ["GET", "POST", "DELETE", "PUT", "PATCH"] as const;
export const HTTP_PARTS = ["body", "headers", "queries", "params"] as const;

export const createDebug = (ns: string) => createDebugger(`kitva:${ns}`);

export const warn = (...args: any) => console.log(bold(yellow("warn:")), ...args);

export function objectMap(obj: AnyMap, map: (value: AnyMap, prop: string) => any) {
    const new_obj: AnyMap = {};

    for (const prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            const value = obj[prop];
            new_obj[prop] = map(value, prop);
        }
    }

    return new_obj;
}
