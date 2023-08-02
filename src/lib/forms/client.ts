import { enhance } from "$app/forms";
import { beforeNavigate } from "$app/navigation";
import { page } from "$app/stores";
import { onDestroy } from "svelte";
import { derived, get, readonly, writable } from "svelte/store";
import type { AnyError, AnyMap, ValidationResult } from "../types.js";
import { filterEmptyFields, objectMap } from "../utils/index.js";
import { useStorage } from "./storage.js";
import type { CreateClientOption, FormValidationClient } from "./types.js";

export function createValidationClient(opts: CreateClientOption): FormValidationClient {
	const {
		validate,
		getFormErrors,
		action,
		fields: initial_fields = {},
		use_storage = true,
		use_enhance = true,
		warn_user = true,
		form_id
	} = opts;

	const fields = writable<AnyMap>(filterEmptyFields(initial_fields));

	const set_fields = fields.set;
	fields.set = (value) => set_fields(filterEmptyFields(value));

	const validate_result = derived(
		fields,
		(values) => validate(values) as ValidationResult<AnyMap>
	);

	const errors = derived(validate_result, (result) => {
		if (result.errors) {
			return getFormErrors(result.errors);
		}
	});

	const errs = writable<Record<string, string>>({});

	function setErrors(new_errs: Record<string, AnyError> | undefined | null) {
		errs.set(new_errs ? objectMap(new_errs, (err) => err?.message || "") : {});
	}

	const loading = writable(false);

	let timeout: any;

	if (Object.keys(initial_fields).length) {
		validateForm();
	}

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
	});

	function validateForm(field?: string) {
		const form_errors = get(errors);
		if (form_errors && field) {
			errs.update((errs) => {
				errs[field] = form_errors[field]?.message;
				return errs;
			});
		} else {
			setErrors(form_errors);
		}
	}

	function onInput(e: Event) {
		const target = e.target as HTMLElement;
		const name = target?.getAttribute("name");
		if (!name) return;
		clearTimeout(timeout);

		timeout = setTimeout(() => validateForm(name), 250);
	}

	let current_form: HTMLFormElement | null;
	let vite_hmr_reload = false;
	if (import.meta.hot) {
		import.meta.hot.on("vite:beforeFullReload", () => {
			vite_hmr_reload = true;
		});
	}

	let submitting: boolean;

	if (warn_user) {
		beforeNavigate((nav) => {
			if (!current_form || vite_hmr_reload) {
				return;
			}

			if (!confirm("Are sure you want to leave?") && !submitting) {
				nav.cancel();
			}
		});
	}

	function svelte_action(form: HTMLFormElement) {
		const storage = use_storage && useStorage(action, fields);

		current_form = form;
		form.addEventListener("input", onInput);
		form.addEventListener("submit", () => {
			submitting = true;
		});

		const enhancer =
			use_enhance &&
			enhance(form, ({ cancel }) => {
				if (get(loading)) {
					return cancel();
				}

				validateForm();

				if (!get(validate_result).valid) {
					return cancel();
				}

				loading.set(true);

				return async ({ update, result }) => {
					loading.set(false);
					submitting = false;
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
				storage && storage.unsubscribe();
				form.removeEventListener("input", onInput);
				unsubscribe_page();
			}
		};
	}

	return {
		result: validate_result,
		fields,
		loading: readonly(loading),
		errs: readonly(errs),
		errors,
		validateForm,
		action: svelte_action,
		action_url: action == "default" ? "" : `?/${action}`,
		id: form_id
	};
}
