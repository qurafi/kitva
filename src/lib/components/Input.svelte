<script lang="ts" generics="FormDefs">
	import { config } from "./globals.js";

	/* global FormDefs */
	import type { AjvError } from "$lib/index.js";
	import { getContext } from "svelte";
	import type { HTMLInputAttributes, HTMLLabelAttributes } from "svelte/elements";
	import type { Writable } from "svelte/store";
	import type { FormValidationClient } from "../forms/types.js";

	type ExtractWritable<T> = T extends Writable<infer R> ? R : never;

	type FormType = FormValidationClient<FormDefs, AjvError>;

	type $$Props = {
		form: FormType;
		name: keyof ExtractWritable<(typeof form)["fields"]> & string;
		label?: string;
		labelProps?: HTMLLabelAttributes;
		errorClass?: string;
	} & Omit<HTMLInputAttributes, "form" | "name" | `${"on" | "bind"}:${string}`>;

	export let form: FormType = getContext("kitva:form");

	export let name: $$Props["name"];

	export let label = name as string;
	export let labelProps: $$Props["labelProps"] = undefined;

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
</script>

<label {...labelProps} {...config.labelProps} for={input_id}>{label}</label>
{#if $$restProps.type == "checkbox"}
	<input type="checkbox" bind:checked={$fields[name]} value="true" {...input_props} />
{:else}
	<input type="text" bind:value={$fields[name]} {...input_props} />
{/if}
<p
	id={err_id}
	class={errorClass}
	style:visibility={error ? "visible" : "hidden"}
	{...config.errorProps}
>
	{error}
</p>
