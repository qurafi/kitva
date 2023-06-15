# Kitva - Validation Kit for Sveltekit

Validate your endpoints and forms with no boilerplate, Just define your schemas alongside your routes and this tool will take care of validation, type generation and form client generation.

## Showcase

<https://github.com/qurafi/kitva/assets/15172611/e45b5441-7961-43ab-8515-a6a362a85fe1>

## Features

* **Standard**: Uses json schema standard as the default schema format
* **Performance**: Compile your schemas into highly optmized validation code, thanks to Ajv.
* **Less boilerplate**: Endpoints and forms are automatically validated by a global sveltekit hook.
* **Typesafety**: Types are automatically generated and handled for you.
* **Form client**: Client to handle form validation with full type-safety and no boilerplate as possible and it's designed to work without any javascript.

## Get Started

`npm i kitva` / `pnpm i kitva`

and then run:
`npm run kitva` / `pnpm kitva`

**NOTE:** This command will edit your vite.config, tsconfig, so it's recommended to commit your work.

## Writing schemas

### Schema format

Json schemas are used as schema format by default. All schema validation is handled by Ajv. Althought we kinda made it possible to use other formats, but we currently only focus on json schemas.

For more information about json schemas. Consult one of the following links:

* [Ajv docs](https://ajv.js.org/json-schema.html)
* [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/)
* [JSON Schema Spec Draft-07](https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-00)

**NOTE**: This library does not handle any schema compilation or any schema specific logic. It uses [ajv-build-tools](https://github.com/qurafi/ajv-tools) plugin under the hood to manage the compilation. If you have any issue regarding compilation, please open issue there.

### Define schemas

There's two kind of schema files:

* A shared one that's defined in `$lib/schemas`
* A route schema which include some enhancement including type generation for forms and endpoints.

**Example of an endpoint schema file**

```typescript
/* routes/api/login
    +server
    schema.ts
*/
export const POST = {
    body: {
        type: "object",
        properties: {
            username: {
                type:"string",
                minLength: 3,
                maxLength: 36
            },
            password: {
                type:"string",
                minLength: 6,
                maxLength: 128,
                format: "password" // just a hint for the UI
            },
            email: {
                type:"string",
                minLength: 6,
                maxLength: 100,
                format: "email"
            }
        },
        // additional properties allowed by default per the standard
        additionalProperties: false,
        // properties are optional by default
        required: ["username", "password", "email"]
    },
    // queries, headers, params
}
```

And that's it. Your endpoint will automatically validated. To get the parsed data use the event.locals.validation.body

```typescript
// all related types available in the new $types2 file

import type { POSTHandler } from "./$types2";

export const POST: POSTHandler = async (event) => {
    // data is fully typed
    const { data } = event.locals.validation.body;
    return text("ok");
};
```

**Type builders**

You could use some type builders such as [fluent-json-schema](https://github.com/fastify/fluent-json-schema) and [TypeBox](https://github.com/sinclairzx81/typebox) to make life easier:

```typescript
import { Type as t } from "@sinclair/typebox";

export const POST = {
    body: t.Object(
        {
            username: t.String({
                minLength: 3,
                maxLength: 36,
            }),
            password: t.String({
                format: "password", // just a hint for the UI
                minLength: 6,
                maxLength: 128,
            }),
            email: t.String({
                format: "email",
                minLength: 6,
                maxLength: 100,
            }),
        },
        { additionalProperties: false }
    ),
};
```

**NOTE:** TypeBox support type interference but currently all schemas are converted to types by [json-schema-to-typescript](https://github.com/bcherny/json-schema-to-typescript)

**Form actions:**

```typescript
/* routes/api/login
    +page.svelte
    +page.server.ts
    schema.ts
*/
export const actions = {
    signup: {
        body: {
            ...
        }
        
    },
    // queries, headers, params
}
```

This will require calling withValidation as there's no current possible way to intercept and change form result in Sveltekit:

```typescript
import { withValidation } from "kitva/forms/server";
import type { Actions } from "./$types";

export const actions: Actions = withValidation({
    default(event) {
        return {
            success: true,
        };
    },
});
```

**Using the client:**
To use the client simply import `./$form/action`. The types will be automatically handled.

```svelte
<script>
import { createValidate } from "./$form/default";

const my_form = createValidate(initial_fields);
const { fields, errors, is_valid, action, action_url } = my_form;
// fields, errors are fully type safe
</script>


<form>
    <label>
        Username
        <input
            type="text"
            name="username"
            autocomplete="username"
            bind:value={$fields.username}
        />
        <p class="error">{$errors.username || ""}</p>
    </label>
...
</form>
```

[WIP]

* [ ] Input component to render form fields with errors and binding and everything.
* [ ] attachValidation options to skip validation and assign the validation function to locals.validate
* [ ] Some Real world example
