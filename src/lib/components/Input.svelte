<!-- global $$Generic -->
<script lang="ts">
	import type { Writable } from "svelte/store";
	import type { HTMLInputAttributes, HTMLLabelAttributes } from "svelte/elements";

	import type { FormValidationClient } from "../forms/types.js";

	type T = $$Generic<any>;
	type ExtractWritable<T> = T extends Writable<infer R> ? R : never;

	export let form: $$Props["form"];

	export let name: $$Props["name"];

	const { fields, errs } = form;

	export let label = name as string;

	export let labelProps: $$Props["labelProps"] = undefined;

	export let errorClass = "error";

	interface $$Props extends Omit<HTMLInputAttributes, "form" | "name"> {
		form: FormValidationClient<T>;
		name: keyof ExtractWritable<(typeof form)["fields"]> & string;
		label?: string;
		labelProps?: HTMLLabelAttributes;
		errorClass?: string;
	}

	let err_id: string | undefined;
	let error: string | undefined;

	$: error = $errs[name];

	$: if (error) {
		const hash = (Math.random() * Number.MAX_SAFE_INTEGER) | 0;
		err_id = `${form.action_url.slice(2) || "default"}${hash.toString(16)}`;
	} else {
		err_id = undefined;
	}
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
