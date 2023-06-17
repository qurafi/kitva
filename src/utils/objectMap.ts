import type { AnyMap } from "./index.js";

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
