import { bold, red, yellow } from "kleur/colors";

import createDebugger from "debug";

export type AnyMap = Record<string, any>;
export type MaybePromise<T> = Promise<T> | T;

export const HTTP_METHODS = ["GET", "POST", "DELETE", "PUT", "PATCH"] as const;
export const HTTP_PARTS = ["body", "headers", "queries", "params"] as const;

export const createDebug = (ns: string) => createDebugger(`kitva:${ns}`);

function delayed<T extends (...args: any[]) => any>(ms: number, fn: T) {
	return (...args: Parameters<T>) => {
		setTimeout(() => fn(...args), ms);
	};
}

export function warn(msg: string, ...args: any[]) {
	console.warn(`${bold(yellow("warn:"))} ${msg}`, ...args);
}

export function error(msg: string, ...args: any[]) {
	console.error(`${bold(red("ERROR:"))} ${msg}`, ...args);
}

const LOG_MS = 200;
export const defer_warn = delayed(LOG_MS, warn);
export const defer_error = delayed(LOG_MS, error);

// we will treat any empty string as undefined as all formData entry is either a file or a string
export function filterEmptyFields(input: AnyMap) {
	const filtered = Object.entries(input).filter(([_, value]) => {
		return value !== "";
	});
	return Object.fromEntries(filtered);
}

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
