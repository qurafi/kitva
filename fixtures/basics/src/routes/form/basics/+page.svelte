<script lang="ts">
	import type { PageData } from "./$types.js";
	import { page } from "$app/stores";

	import { createDefaultActionForm as createValidate } from "./$form";

	const enhance_param = $page.url.searchParams.get("enhance") || "true";
	const use_enhance = enhance_param == "true";

	const [valid, invalid] = [
		{
			username: "username",
			email: "username@example.com",
			password: "123456",
			first_name: "Username"
		},
		{
			username: "",
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
		use_enhance
	});

	const { fields, errs, loading, result } = my_form;
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
				<label>
					User
					<input type="text" name="username" bind:value={$fields.username} />
					<p class="error">{$errs.username || ""}</p>
				</label>

				<label>
					Email
					<input type="email" name="email" bind:value={$fields.email} />
					<p class="error">{$errs.email || ""}</p>
				</label>

				<label>
					Password
					<input type="password" name="password" bind:value={$fields.password} />
					<p class="error">{$errs.password || ""}</p>
				</label>

				<label>
					First Name:
					<input type="text" name="first_name" bind:value={$fields.first_name} />
					<p class="error">{$errs.first_name || ""}</p>
				</label>

				<label>
					Last name (optional)
					<input type="text" name="last_name" bind:value={$fields.last_name} />
					<p class="error">{$errs.last_name || ""}</p>
				</label>

				<!-- check for unkown fields(depending on additionalProperties) -->
				<!-- <input type="text" name="last_name" bind:value={$fields.unknown} /> -->

				<!-- handle checkboxes(boolean) -->
				<label>
					Accept Term of services
					<!-- value="true" -->
					<input
						type="checkbox"
						name="accept_tos"
						bind:checked={$fields.accept_tos}
						value="true"
					/>
					<p class="error">{$errs.accept_tos || ""}</p>
				</label>

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

	input {
		display: block;
	}

	.error {
		font-size: small;
		margin-top: 0;
		min-height: 0.5em;
	}

	.error::after {
		content: "";
		display: inline-block;
	}

	form button[type="submit"]:disabled {
		opacity: 0.8;
		cursor: not-allowed;
	}

	form .error {
		color: red;
	}
</style>
