<script lang="ts">
	import type { FormValidationClient } from "$lib/types/forms.js";
	import type { ErrorLabelProp, LabelProp, InputProp } from "./index.js";

	export let label: LabelProp;
	export let error: ErrorLabelProp | undefined;
	export let input: InputProp;

	export let fields: FormValidationClient["fields"];

	let name: string;

	$: name = input.attrs.name!;
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label {...label.attrs}>{label.text}</label>

{#if $$restProps.type == "checkbox"}
	<input type="checkbox" bind:checked={$fields[name]} value="true" {...input.attrs} />
{:else}
	<input type="text" bind:value={$fields[name]} {...input.attrs} />
{/if}
{#if error}
	<p {...error.attrs}>{error.text}</p>
{/if}
