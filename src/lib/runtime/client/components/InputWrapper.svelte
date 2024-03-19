<script lang="ts" generics="FormDefs">
	/* global FormDefs */
	import type { ErrorLabelProp, LabelProp } from "./index.js";
	import { getContext } from "svelte";
	import type { HTMLInputAttributes, HTMLLabelAttributes } from "svelte/elements";
	import type { Writable } from "svelte/store";
	import type { FormValidationClient } from "../../../types/forms.js";
	import { config } from "../client_globals.js";

	type ExtractWritable<T> = T extends Writable<infer R> ? R : never;

	type FormType = FormValidationClient<FormDefs>;

	type $$Props = {
		form: FormType;
		name: keyof ExtractWritable<(typeof form)["fields"]> & string;
		label?: string;
		labelProps?: HTMLLabelAttributes;
		errorClass?: string;
		errorPosition?: "top" | "bottom";
		componentProps?: Record<string, any> | undefined;
	} & Omit<HTMLInputAttributes, "form" | "name" | `${"on" | "bind"}:${string}`>;

	export let form: FormType = getContext("kitva:form");

	export let name: $$Props["name"];

	export let label = name as string;
	export let labelProps: $$Props["labelProps"] = undefined;

	/**
	 * Pass props to Custom input component
	 */
	export let componentProps: $$Props["componentProps"] = undefined;

	export let errorClass = "error";

	const { fields, errs } = form;

	let input_id: string;
	let input_props: HTMLInputAttributes;

	let error: string | undefined;
	let err_id: string | undefined;

	$: input_id = `${form.id}-${name}`;

	$: error = $errs[name];
	$: err_id = error && `${form.id}-err-${name}`;

	$: input_props = {
		name,
		"aria-invalid": error !== undefined,
		"aria-errormessage": err_id,
		id: input_id,
		...config.inputProps,
		...$$restProps
	};

	let label_props: LabelProp;
	let error_props: ErrorLabelProp | undefined;

	$: error_props = error
		? {
				text: error,
				attrs: {
					id: err_id,
					class: errorClass,
					...config.errorProps
				}
		  }
		: undefined;

	$: label_props = {
		text: label,
		attrs: {
			...config.labelProps,
			...labelProps,
			for: input_id
		}
	};

	let component = config.inputComponent;
</script>

<svelte:component
	this={component}
	{fields}
	label={label_props}
	error={error_props}
	input={{ attrs: input_props }}
	{...componentProps}
/>
