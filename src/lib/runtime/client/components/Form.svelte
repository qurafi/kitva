<script lang="ts" generics="FormDefs">
	/* global FormDefs */
	import type { FormValidationClient } from "$lib/types/forms.js";
	import { SvelteComponent, setContext } from "svelte";
	import type { HTMLFormAttributes } from "svelte/elements";
	import Input from "./InputWrapper.svelte";
	import { config } from "../client_globals.js";

	type InferProp<Cmp> = Cmp extends typeof SvelteComponent<infer Prop extends Record<string, any>>
		? Prop
		: never;

	type InputProps = InferProp<typeof Input<FormDefs>>;

	type FormType = FormValidationClient<FormDefs>;

	export let form: FormType;

	interface $$Props extends Omit<HTMLFormAttributes, `on:${string}`> {
		form: FormType;
	}

	setContext("kitva:form", form);

	const InputComponent: typeof SvelteComponent<Omit<InputProps, "form">> = Input;
</script>

<form method="post" use:form.action action={form.action_url} {...config.formProps} {...$$restProps}>
	<slot Input={InputComponent} />
</form>
