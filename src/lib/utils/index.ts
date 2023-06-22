import { bold, red, yellow } from "kleur/colors";

import createDebugger from "debug";

export type AnyMap = Record<string, any>;
export type MaybePromise<T> = Promise<T> | T;

export const HTTP_METHODS = ["GET", "POST", "DELETE", "PUT", "PATCH"] as const;
export const HTTP_PARTS = ["body", "headers", "queries", "params"] as const;

export const createDebug = (ns: string) => createDebugger(`kitva:${ns}`);

const log_ms = 200;

export const warn = (msg: string, ...args: any) => {
	setTimeout(() => console.warn(`${bold(yellow("warn:"))} ${msg}`, ...args), log_ms);
};
export const error = (msg: string, ...args: any) => {
	setTimeout(() => console.error(`${bold(red("ERROR:"))} ${msg}`, ...args), log_ms);
};
export const info = (msg: string, ...args: any) => {
	setTimeout(() => console.log(`${bold(red("info:"))} ${msg}`, ...args), log_ms);
};

// we will treat any empty string as undefined as all formData entry is either a file or a string
export function filterEmptyFields(input: AnyMap) {
	const filtered = Object.entries(input).filter(([_, value]) => {
		return value !== "";
	});
	return Object.fromEntries(filtered);
}
