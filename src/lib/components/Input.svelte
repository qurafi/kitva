<script lang="ts">
	/* global $$Generic */
	import type { Writable } from "svelte/store";
	import type { HTMLInputAttributes, HTMLLabelAttributes } from "svelte/elements";

	import type { FormValidationClient } from "../forms/types.js";

	type T = $$Generic<any>;
	type ExtractWritable<T> = T extends Writable<infer R> ? R : never;

	export let form: $$Props["form"];

	export let name: $$Props["name"];

	export let label = name as string;

	export let labelProps: $$Props["labelProps"] = undefined;

	export let errorClass = "error";

	export let err_id: string = `${form.id}-err-${name}`;

	interface $$Props extends Omit<HTMLInputAttributes, "form" | "name"> {
		form: FormValidationClient<T>;
		name: keyof ExtractWritable<(typeof form)["fields"]> & string;
		label?: string;
		labelProps?: HTMLLabelAttributes;
		errorClass?: string;
	}

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
			{...$$restProps}
			bind:checked={$fields[name]}
			value="true"
			{...$$restProps}
			{name}
			aria-invalid={error !== undefined}
			aria-errormessage={err_id}
		/>
	{:else}
		<input
			type="text"
			bind:value={$fields[name]}
			{...$$restProps}
			{name}
			aria-invalid={error !== undefined}
			aria-errormessage={err_id}
		/>
	{/if}
	<p id={err_id} class={errorClass} style:visibility={error ? "visible" : "hidden"}>{error}</p>
</label>
