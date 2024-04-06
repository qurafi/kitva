import { enhance } from "$app/forms";
import { beforeNavigate } from "$app/navigation";
import { page } from "$app/stores";
import { BROWSER } from "esm-env";
import { onDestroy } from "svelte";
import { derived, get, readonly, writable } from "svelte/store";
import { filterEmptyFields, objectMap } from "$lib/shared/utils.js";
import type { AnyMap, ErrorMap } from "$lib/types.js";
import type {
	CreateClientOption,
	FormResult,
	FormValidationClient,
	GeneratedClientOptions
} from "$lib/types/forms.js";
import {
	getFormErrors,
	type AjvCompiledValidationFunction,
	type AjvError,
	createAjvValidateFn
} from "../ajv/index.js";
import { config } from "./client_globals.js";
import { useStorage } from "./storage.js";
import type { Localize } from "../ajv/localization.js";

export function createValidationClient<Data = any>(
	opts: CreateClientOption<Data>
): FormValidationClient<Data> {
	const defaults = config.instanceDefaults;
	const default_opts = typeof defaults == "function" ? defaults(opts) : defaults;

	const {
		validate,
		action,
		fields: initial_fields = {},
		use_storage = true,
		use_enhance = true,
		warn_user = true,
		form_id,
		localize,
		locale = "en"
	} = { ...default_opts, ...opts };

	const lang =
		typeof locale === "string" ? locale : BROWSER && locale && navigator.language.toLowerCase();

	const fields = writable<AnyMap>(filterEmptyFields(initial_fields));
	const set_fields = fields.set;
	fields.set = (value) => set_fields(filterEmptyFields(value));

	const validate_result = derived(fields, (values) => validate(values));

	const errors = derived(validate_result, (result) => {
		if (result.errors) {
			return getFormErrors(result.errors);
		}
	});

	const errs = writable<Record<string, string>>({});

	function apply_locale(lang: string, errors: ErrorMap, update: () => void) {
		const result = localize(lang, Object.values(errors).filter(Boolean) as AjvError[]);
		result?.finally(update);
	}

	function setErrors(new_errs: ErrorMap | undefined | null, use_localize = true) {
		const update = () => {
			errs.set(new_errs ? objectMap(new_errs, (err) => err?.message || "") : {});
		};

		if (BROWSER && lang && new_errs && use_localize) {
			apply_locale(lang, new_errs, update);
			return;
		}
		update();
	}

	const loading = writable(false);

	const unsubscribe_page = page.subscribe(({ form }) => {
		const form_result = form as FormResult;
		if (form_result?.action == action) {
			const { input, errors: form_errors } = form_result;
			if (input) {
				fields.set(input);
			}

			if (form_errors) {
				setErrors(form_errors, false);
			}
		}
	});

	onDestroy(() => {
		unsubscribe_page();
	});

	function validateForm(field?: string) {
		const form_errors = get(errors);
		if (form_errors && field) {
			const update = () => {
				errs.update((errs) => {
					const err = form_errors[field];
					if (err) {
						errs[field] = err.message;
					}

					return errs;
				});
			};

			if (BROWSER && lang && form_errors) {
				apply_locale(lang, form_errors, update);
				return;
			}
			update();
		} else {
			setErrors(form_errors);
		}
	}

	let timeout: any;
	let modified = false;
	function onInput(e: Event) {
		modified = true;
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
			if (!submitting || !modified || !current_form || vite_hmr_reload) {
				return;
			}

			if (!confirm("Are sure you want to leave?")) {
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
						fields.set(initial_fields);
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
		fields: fields as any,
		loading: readonly(loading),
		errs: readonly(errs) as any,
		errors: errors as any,
		validateForm,
		action: svelte_action,
		action_url: `${action == "default" ? "?" : `?/${action}`}${
			locale ? `&locale=${locale}` : ""
		}`,
		schema: validate.schema as any,
		id: form_id
	};
}

export function defineGenerated<Data>(
	action: string,
	id: string,
	validate: AjvCompiledValidationFunction,
	localize: Localize
) {
	return (opts: GeneratedClientOptions<Data> = {}) => {
		return createValidationClient({
			validate: createAjvValidateFn<Data>(validate, true),
			action,
			form_id: id,
			localize,
			...opts
		});
	};
}
