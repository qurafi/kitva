import { BROWSER } from "esm-env";
import type { FormValidationClient } from "./types.js";
import { get } from "svelte/store";

export function useStorage(
	form_id: string,
	fields: FormValidationClient["fields"],
	only?: string[]
) {
	let changed = false;
	if (!BROWSER) {
		return;
	}

	try {
		const storedFields = JSON.parse(sessionStorage.getItem(form_id) || "{}");
		if (Object.keys(storedFields).length) {
			fields.set(storedFields);
		}
	} catch {
		//
	}

	const unsubscribe_fields = fields.subscribe(() => {
		if (changed) {
			sessionStorage.setItem(form_id, JSON.stringify(get(fields), only));
		}
		changed = true;
	});

	return {
		unsubscribe: unsubscribe_fields
	};
}
