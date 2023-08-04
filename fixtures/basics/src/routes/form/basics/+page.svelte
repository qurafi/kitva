<script lang="ts">
	import { page } from "$app/stores";

	import { createDefaultActionForm as createValidate } from "./$form";
	import { Input } from "kitva";

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

	// form result typed
	export let form;

	// form result in __form_action format
	// will contains the "input" data and the "errors"
	form?.__form_default_action;

	// create form validation with initial values
	// this will take form.__form_action and the validation function
	// you could fill form fields from page data as well (as long its type safe)
	const fill_param = $page.url.searchParams.get("fill");
	const my_form = createValidate({
		fields: fill_param ? (fill_param == "valid" ? valid : invalid) : {},
		locale: use_locale,
		use_enhance
	});

	const { fields, loading } = my_form;
</script>

<div class="container">
	{#if form?.success}
		<div>
			<p>Successfully sumbitted your response:</p>
			<a href="basics">Submit another forum</a>
		</div>
	{:else}
		<div>
			<pre>{JSON.stringify($fields, null, 2)}</pre>

			<form
				method="post"
				action={my_form.action_url}
				novalidate
				use:my_form.action
				autocomplete="off"
			>
				<!-- <label>
					User
					<input type="text" name="username" bind:value={$fields.username} />
					<p class="error">{$errs.username || ""}</p>
				</label> -->

				<Input form={my_form} name="username" label="Username:" />
				<Input form={my_form} name="email" label="Email:" />
				<Input form={my_form} name="password" label="Password:" />
				<Input form={my_form} name="first_name" label="First Name:" />
				<Input form={my_form} name="last_name" label="Last Name(optional):" />

				<Input
					form={my_form}
					name="accept_tos"
					type="checkbox"
					label="Accept Term of services"
				/>

				<!-- check for unkown fields(depending on additionalProperties) -->
				<!-- <input type="text" name="last_name" bind:value={$fields.unknown} /> -->
				<!-- <Input form={my_form} fields="unknown" /> -->

				<button type="submit" disabled={$loading}>
					Submit{$loading ? "ting" : ""}
				</button>
				<a href="./no-schema" data-sveltekit-reload>Another page</a>
			</form>
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

	form :global(input) {
		display: block;
	}

	form :global(.error) {
		font-size: small;
		margin-top: 0;
		min-height: 0.5em;
		color: red;
	}

	form :global(.error)::after {
		content: "";
		display: inline-block;
	}

	form button[type="submit"]:disabled {
		opacity: 0.8;
		cursor: not-allowed;
	}
</style>
