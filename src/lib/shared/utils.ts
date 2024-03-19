import { LIB_NAME } from "./constants.js";

export type AnyMap = Record<string, any>;
export type MaybePromise<T> = Promise<T> | T;

export function delayed<T extends (...args: any[]) => any>(ms: number, fn: T) {
	return (...args: Parameters<T>) => {
		setTimeout(() => fn(...args), ms);
	};
}

// we will treat any empty string as undefined as all formData entry is either a file or a string
export function filterEmptyFields(input: AnyMap) {
	const filtered = Object.entries(input).filter(([_, value]) => {
		return value !== "";
	});
	return Object.fromEntries(filtered);
}

//TODO Improve types
export function objectMap(obj: AnyMap, map: (value: any, prop: string) => any) {
	const new_obj: AnyMap = {};

	for (const prop in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, prop)) {
			const value = obj[prop];
			new_obj[prop] = map(value, prop);
		}
	}

	return new_obj;
}
export class KitvaError extends Error {
	name = `${LIB_NAME}Error`;
}

export function isObject(x: unknown): x is Record<string, any> {
	return !!x && typeof x == "object" && !Array.isArray(x);
}
