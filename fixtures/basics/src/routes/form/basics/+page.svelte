<script lang="ts">
    import { enhance } from "$app/forms";
    import type { PageData } from "./$types.js";
    import { page } from "$app/stores";

    //TODO generated types
    import { createValidate } from "./$form/default_action";

    const enhance_ =
        $page.url.searchParams.get("enhance") == "false" ? () => {} : enhance;

    const [valid, invalid] = [
        {
            username: "username",
            email: "username@example.com",
            first_name: "Username",
        },
        {
            username: "",
            email: "test@",
        },
    ];

    export let data: PageData;

    // form result typed
    export let form;

    // form result in __form_action format
    // will contains the "input" data and the "errors"
    form?.__form_default_action;

    // create form validation with initial values
    // this will take form.__form_action and the validation function
    // you could fill form fields from page data as well (as long its type safe)
    const fill_param = $page.url.searchParams.get("fill");
    const my_form = createValidate(
        fill_param ? (fill_param == "valid" ? valid : invalid) : {}
    );

    const { fields, errors, is_valid, action, action_url } = my_form;

    let x = $fields.username;

    // $: console.log($fields);

    // $: console.log($fields.accept_tos);

    // $: console.log("errors", $errors);
</script>

<p>{JSON.stringify($fields, null, 2)}</p>
{#if form?.success}
    <p>Successfully sumbitted your response:</p>
    <a href=".">Submit another forum</a>
{:else}
    <pre id="data">{JSON.stringify(form, null, 2)}</pre>
    <form
        method="post"
        action={my_form.action_url}
        enctype="multipart/form-data"
        use:my_form.action
        use:enhance_
        novalidate
    >
        <label>
            User
            <input
                type="text"
                name="username"
                autocomplete="username"
                bind:value={$fields.username}
            />
            <p class="error">{$errors.username || ""}</p>
        </label>

        <label>
            Email
            <input type="email" name="email" bind:value={$fields.email} />
            <p class="error">{$errors.email || ""}</p>
        </label>

        <label>
            First Name:
            <input type="text" name="first_name" id="" bind:value={$fields.first_name} />
            <p class="error">{$errors.first_name || ""}</p>
        </label>

        <label>
            Last name (optional)
            <input type="text" name="last_name" id="" bind:value={$fields.last_name} />
            <p class="error">{$errors.last_name || ""}</p>
        </label>

        <!-- check for unkown fields(depending on additionalProperties) -->
        <!-- <input type="text" name="last_name" id="" bind:value={$fields.unknown} /> -->

        <!-- handle checkboxes(boolean) -->
        <label>
            Accept Term of services
            <!-- value="true" -->
            <input
                type="checkbox"
                name="accept_tos"
                bind:checked={$fields.accept_tos}
                value="1"
            />
            <p class="error">{$errors.accept_tos || ""}</p>
        </label>

        <button type="submit">Submit</button>
    </form>
{/if}

<style>
    /* my eyes */
    :global(html) {
        color-scheme: dark;
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
