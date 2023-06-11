import { bold, red, yellow } from "kleur/colors";

import createDebugger from "debug";

export type AnyMap = Record<string, any>;
export type MaybePromise<T> = Promise<T> | T;

export const HTTP_METHODS = ["GET", "POST", "DELETE", "PUT", "PATCH"] as const;
export const HTTP_PARTS = ["body", "headers", "queries", "params"] as const;

export const createDebug = (ns: string) => createDebugger(`kitva:${ns}`);

export const warn = (...args: any) => console.warn(bold(yellow("warn:")), ...args);
export const error = (...args: any) => console.error(bold(red("ERROR:")), ...args);
export const info = (...args: any) => console.log(bold(red("info:")), ...args);
