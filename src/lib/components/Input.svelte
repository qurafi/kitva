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
	export let err_id = `${form.id}-err-${name}`;

	const { fields, errs } = form;

	let error: string | undefined;
	let err_id_state: string | undefined;

	$: error = $errs[name];
	$: err_id_state = error === undefined ? undefined : err_id;
</script>

<label {...labelProps}>
	<span>{label}</span>
	{#if $$restProps.type == "checkbox"}
		<input
			type="checkbox"
			bind:checked={$fields[name]}
			value="true"
			{name}
			aria-invalid={error !== undefined}
			aria-errormessage={err_id_state}
			{...config.inputProps}
			{...$$restProps}
		/>
	{:else}
		<input
			type="text"
			bind:value={$fields[name]}
			{name}
			aria-invalid={error !== undefined}
			aria-errormessage={err_id_state}
			{...config.inputProps}
			{...$$restProps}
		/>
	{/if}
	<p
		id={err_id_state}
		class={errorClass}
		style:visibility={error ? "visible" : "hidden"}
		{...config.errorProps}
	>
		{error}
	</p>
</label>
