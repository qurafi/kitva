import { page } from "$app/stores";
import { get, writable, derived, readonly, type Readable } from "svelte/store";
import { objectMap } from "../utils/objectMap.js";
import type { FormValidationClient } from "./types.js";
import type { AnyMap, ValidationResult } from "../types.js";
import type { GetFormErrors, ValidateFn } from "../hook/types.js";
import { form_urlencoded } from "../utils/http.js";
import { BROWSER, DEV } from "esm-env";
import { filterEmptyFields, warn } from "../utils/index.js";
import { enhance } from "$app/forms";
import { onDestroy } from "svelte";
import type { Unsubscriber } from "svelte/store";
import { beforeNavigate } from "$app/navigation";

function isReadableStore(x: any): x is Readable<any> {
	return typeof x?.subscribe === "function";
}

export function createValidationClient(
	validate: ValidateFn,
	action: string,
	initial_fields: AnyMap | Readable<AnyMap>,
	getFormErrors: GetFormErrors,

	use_storage = true,

	/** used internally for use_storage */
	key = "1",

	use_enhance = true
): FormValidationClient {
	const fields = writable<AnyMap>({});
	const set_fields = fields.set;

	const storage_key = BROWSER ? `kitva_form_${action}:${key}` : "";
	fields.set = function (value) {
		const new_value = filterEmptyFields(value);
		set_fields(new_value);
		if (use_storage && BROWSER) {
			if (Object.keys(new_value).length) {
				sessionStorage.setItem(storage_key, JSON.stringify(new_value));
				return;
			}
			sessionStorage.removeItem(storage_key);
		}
	};

	let unsubscribe_initial_fields: Unsubscriber | undefined;

	const stored_fields = BROWSER && sessionStorage.getItem(storage_key);
	if (stored_fields) {
		initial_fields = JSON.parse(stored_fields);
	}

	if (isReadableStore(initial_fields)) {
		unsubscribe_initial_fields = initial_fields.subscribe((values) => {
			fields.set(values);
		});
	} else {
		fields.set(initial_fields);
	}

	const validate_result = derived(
		fields,
		(values) => validate(values) as ValidationResult<AnyMap>
	);

	const is_valid = derived(validate_result, (result) => result.valid);

	const data = derived(validate_result, (result) => result.data);

	const errors = derived(validate_result, (result) => {
		return result.errors ? getFormErrors(result.errors) : {};
	});

	const errs = writable<Record<string, string>>({});

	function setErrors(new_errs: AnyMap | undefined | null) {
		errs.set(new_errs ? objectMap(new_errs, (err) => err?.message || "") : {});
	}

	const loading = writable(false);

	// we make sure to validate initial fields
	if (Object.keys(initial_fields).length) {
		validateForm();
	}

	let timeout: any;

	const unsubscribe_page = page.subscribe(({ form }) => {
		const form_result = form?.[`__form_${action}`];
		if (form_result) {
			const { input, errors: form_errors } = form_result;
			fields.set(input);
			if (form_errors) {
				setErrors(form_errors);
			}
		}
	});

	onDestroy(() => {
		unsubscribe_page();
		unsubscribe_initial_fields?.();
	});

	function validateForm(field?: string) {
		const status = get(validate_result);
		const { valid, errors: raw_errors } = status;
		if (!valid && field) {
			const form_errors = getFormErrors(raw_errors);
			errs.update((errs) => {
				errs[field] = form_errors[field]?.message;
				return errs;
			});
		} else {
			setErrors(valid ? {} : getFormErrors(raw_errors));
		}
	}

	function onInput(e: Event) {
		const target = e.target as HTMLElement;
		const name = target?.getAttribute("name");
		if (!name) return;
		clearTimeout(timeout);

		timeout = setTimeout(() => validateForm(name), 250);
	}

	let vite_hmr_reload = true;
	import.meta.hot?.on("vite:beforeFullReload", () => {
		vite_hmr_reload = true;
	});

	let current_form: HTMLFormElement | null;
	beforeNavigate((nav) => {
		if (!current_form || vite_hmr_reload) {
			return;
		}

		if (!confirm("are sure you want to leave?")) {
			nav.cancel();
		}
	});

	return {
		validate_result,
		fields,
		errors: readonly(errors),
		loading: readonly(loading),
		errs: readonly(errs),
		is_valid,
		validateForm,
		form_data: data,
		action: (form) => {
			current_form = form;

			if (DEV && form.enctype !== form_urlencoded) {
				warn(`it's better to use ${form_urlencoded} enctype for forms`);
			}

			form.addEventListener("input", onInput);

			const enhancer =
				use_enhance &&
				enhance(form, ({ cancel }) => {
					if (get(loading)) {
						return;
					}

					validateForm();

					if (!get(is_valid)) {
						cancel();
						return;
					}

					loading.set(true);

					return async ({ update, result }) => {
						loading.set(false);
						await update();
						if (result.type == "success") {
							fields.set({});
						}
					};
				});

			return {
				destroy() {
					current_form = null;
					enhancer && enhancer.destroy();
					form.removeEventListener("input", onInput);
					unsubscribe_page();
				}
			};
		},
		action_url: action == "default" ? "" : `?/${action}`
	};
}
