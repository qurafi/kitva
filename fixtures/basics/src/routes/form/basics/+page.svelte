<script lang="ts">
	import { page } from "$app/stores";
	import type { actions_default_action } from "./schema_types";
	import { createDefaultActionForm as createValidate } from "./$form";
	import { Form } from "kitva";

	type X = actions_default_action["accept_tos"];

	const enhance_param = $page.url.searchParams.get("enhance") || "true";
	const locale_param = $page.url.searchParams.get("test_use_locale");
	const use_locale = locale_param == "true" || locale_param || false;
	const use_enhance = enhance_param == "true";

	const [valid, invalid] = [
		{
			username: "username",
			email: "username@example.com",
			password: "123456",
			first_name: "Username"
		},
		{
			username: "long_username",
			email: "test@"
		}
	];

	export let form;

	const fill_param = $page.url.searchParams.get("fill");
	const my_form = createValidate({
		fields: fill_param ? (fill_param == "valid" ? valid : invalid) : {},
		locale: use_locale,
		use_storage: false,
		use_enhance
	});

	const { fields, loading } = my_form;
</script>

<div class="container">
	{#if form?.success}
		<div>
			<p>Successfully submitted your response:</p>
			<a href="basics">Submit another forum</a>
		</div>
	{:else}
		<div>
			<pre>{JSON.stringify($fields, null, 2)}</pre>

			<Form form={my_form} autocomplete="off" let:Input>
				<Input type="text" name="username" label="Username:" />
				<Input name="email" label="Email:" />
				<Input name="password" label="Password:" />
				<Input name="first_name" label="First Name:" />
				<Input name="last_name" label="Last Name(optional):" />

				<Input name="accept_tos" type="checkbox" label="Accept Term of services" />

				<button type="submit" disabled={$loading}>
					Submit{$loading ? "ting" : ""}
				</button>
				<!-- to test warn user -->
				<a href="./no-schema" data-sveltekit-reload>Another page</a>
			</Form>
			<button on:click={() => ($fields = valid)}>Valid</button>
			<button on:click={() => ($fields = invalid)}>Invalid</button>
		</div>
	{/if}
	{#if form}
		<pre>Form Result:{JSON.stringify(form, null, 2)}</pre>
	{/if}
</div>

<style>
	/* my eyes */
	:global(html) {
		color-scheme: dark;
	}

	.container {
		display: flex;
	}

	.container div {
		margin-right: 3em;
	}

	.container :global(input) {
		display: block;
	}

	.container :global(.error) {
		font-size: small;
		margin-top: 0;
		min-height: 0.5em;
		color: red;
	}

	.container :global(.error)::after {
		content: "";
		display: inline-block;
	}

	.container button[type="submit"]:disabled {
		opacity: 0.8;
		cursor: not-allowed;
	}
</style>
