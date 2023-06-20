import { BROWSER } from "esm-env";
import type { FormValidationClient } from "./types.js";
import { get } from "svelte/store";

let idx: Record<string, any> = {};

export function useStorage(
	action: string,
	fields: FormValidationClient["fields"],
	only?: string[]
) {
	const id = (idx[action] = (idx[action] || 0) + 1);
	const key = `kitva_form_${action}:${id}`;
	let changed = false;
	if (!BROWSER) {
		return;
	}

	try {
		const storedFields = JSON.parse(sessionStorage.getItem(key) || "{}");
		if (Object.keys(storedFields).length) {
			fields.set(storedFields);
		}
	} catch {
		//
	}

	fields.subscribe(() => {
		if (changed) {
			sessionStorage.setItem(key, JSON.stringify(get(fields), only));
		}
		changed = true;
	});
}

// if a page hot reloaded, we have to reset the global ids
if (import.meta.hot) {
	import.meta.hot.on("vite:beforeUpdate", () => {
		idx = {};
	});
}
