# Kitva - Validation Kit for Sveltekit

Validate your endpoints and forms with no boilerplate, Just define your **schemas.ts** alongside your routes and this tool will take care of validation, type generation and form client generation.

## Showcase

<https://github.com/qurafi/kitva/assets/15172611/e45b5441-7961-43ab-8515-a6a362a85fe1>

## Features

- **Standard**: Uses Json Schema standard as the default schema format
- **Performance**: Compiles your schemas into highly optmized validation code, thanks to Ajv.
- **Less boilerplate**: Endpoints and forms are automatically validated by a global Sveltekit hook.
- **Small bundle sizes**: Just your validation function and the form client and nothing else!
- **Typesafety**: Types are automatically generated and handled for you.
- **Full featured form client**: Just import `./$form` inside your page and your form client is ready to use. With features including:
  - Fully typed, No need to bring types with you.
  - Save your form in session storage.
  - Warning before navigating away.
  - and more.

## Get Started

`npm i kitva`
`pnpm i kitva`

And then:
`npm run kitva`
`pnpm kitva`

**NOTE:** This command will edit your vite config, tsconfig and create $lib/validation/hook file, so it's recommended to commit your work.

### Schema format

Json schemas are used as schema format by default. All schema validation is handled by Ajv. Althought we kinda made it possible to use other formats, but we currently only focus on json schemas.

For more information about json schemas. Consult one of the following links:

- [Ajv docs](https://ajv.js.org/json-schema.html)
- [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/)
- [JSON Schema Spec Draft-07](https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-00)

**NOTE**: This library does not handle any schema compilation or any schema specific logic. It uses [ajv-build-tools](https://github.com/qurafi/ajv-tools) plugin under the hood to manage the compilation. If you have any issue regarding compilation, please open issue there.

### Defining Schemas

There's two kind of schema files:

- A shared one that's defined in `$lib/schemas`
- A route schema which included with some enhancement including type generation for forms and endpoints.

**Example of an endpoint schema file**

```typescript
/* 
    routes/api/login
        +server.ts
        schemas.ts
*/

// or GET, DELETE, etc.
export const POST = {
 body: {
  type: "object",
  properties: {
   username: {
    type: "string",
    minLength: 3,
    maxLength: 36
   },
   password: {
    type: "string",
    minLength: 6,
    maxLength: 128,
    format: "password" // just a hint for the UI
   },
   email: {
    type: "string",
    minLength: 6,
    maxLength: 100,
    format: "email"
   }
  },
  // additional properties allowed by default per the standard
  additionalProperties: false,
  // properties are optional by default
  required: ["username", "password", "email"]
 }
 // validate other parts
 // queries, headers, params
};
```

And that's it. Your endpoint will automatically validated. To get the parsed data use the `event.locals.validation.*` and

```typescript
// all related types available in the new $types2 file
import type { POSTHandler } from "./$types2";

export const POST: POSTHandler = async (event) => {
    // data is fully typed
    // {email:string, username: string, ...}
    const { data } = event.locals.validation.body;
    return text("ok");
};
```

The event local is automatically set by the hook and it contains:

```typescript
event.locals.validation = {
    valid: boolean, // if any part failed
    body/headers/queries/params: {
        valid: boolean,
        data: Data,
        input: JSONType,
        errors: AjvError[]
    },
}
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
    maxLength: 36
   }),
   password: t.String({
    format: "password", // just a hint for the UI
    minLength: 6,
    maxLength: 128
   }),
   email: t.String({
    format: "email",
    minLength: 6,
    maxLength: 100
   })
  },
  { additionalProperties: false }
 )
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
}
```

This will require aditional step by calling withValidation as there's no current possible way to intercept and change form result in Sveltekit:

```typescript
import { withValidation } from "kitva/forms/server";
// NOTE: use $types2
import type { Actions } from "./$types2";

export const actions: Actions = withValidation({
    signup(event) {
        // do something

        return {
            success: true,
        };
    },
    another: ..., // TS error
});
```

**Using the client:**

To use the client, simply import `./$form`. The types will be automatically handled.

All clients are exported by the format, `action_name = createActionNameForm`, e.g., `default = createDefaultForm`.

```svelte
<script>
 import { createDefaultForm } from "./$form";

 const my_form = createDefaultForm(initial_fields);

 const { fields, errs, is_valid, action, action_url } = my_form;
</script>

<form method="post" action={action_url}>
 <label>
  Username
  <input type="text" name="username" autocomplete="username" bind:value={$fields.username} />
  {#if $errs.username}
   <p class="error">{$errs.username}</p>
  {/if}
 </label>
 ...
</form>
```

The client returns the following:

```typescript
my_form = {
    /**
     * Usage with binding values
     * Not type safe because fields could be invalid or missing
     * */
    fields: Writable<Partial<Record<keyof Data, any>>>;

    /**
     * Readable store returns the data when it's valid and it's type safe
     *
     * alias for $validate_result.data
    */
    form_data: Readable<Data | undefined>;

    /** alias of $validate_result.valid */
    is_valid: Readable<boolean>;

    /**
     * Optmized error messages for UI
     * - errors are set to the specific field user start typing into
     * - errors are delayed 250ms after the start of typing
     *
    */
    errs: Readable<Partial<Record<keyof Data, string>>>;

    /**
     * Raw errors, alias for $validation_result.errors
    */
    errors: Readable<Record<keyof Data, Error>>;

    /**
     * Returns {valid: boolean, data: Data, errors: Error[], input: JSONType}
     * */
    validate_result: Readable<ValidationResult<Data, Error>>;

    // all self explanatory
    loading: Readable<boolean>;
    action_url: string;
    action(form:HTMLFormElement)

    // advanced, used for custom validation logic
    validateForm(field?: string): void;
}
```

### Standalone Validation

To directly import and use the compiled validation function for schemas. refer to [ajv-build-tools](https://github.com/qurafi/ajv-tools#importing-the-compiled-schemas)

### **CLI** options

Running the command without arguments will setup every thing listed in [Manual Setup](#manual-setup), but in case you want to setup a specific setup add --only=steps, where steps are comma seperated:
`pnpm kitva --only=hook,vite,types`

### Manual Setup

Usually the CLI will handle most of the setup steps automatically, but just in case, here is the step required to setup Kitva:

1. **Vite plugin**

    ```javascript
    import { defineConfig } from "vite";
    import { sveltekit } from "@sveltejs/kit/vite";
    import { vitePluginSvelteKitva } from "kitva/vite";

    export default defineConfig({
     plugins: [sveltekit(), vitePluginSvelteKitva()]
    });
    ```

2. **Sveltekit hook**

    ```javascript
    // virtual import used to import all the compiled schemas
    import schemas from "$schemas?t=all";

    import { validationHook } from "kitva/hook/index";
    import { createPreset } from "kitva/presets/ajv/server";

    export const preset = createPreset(schemas);

    export const handle = validationHook(preset);
    ```

3. **Setting up rootDir**
   Similar to ".svelte-kit/types" for route types(./$types). Add ".schemas/types" to your rootDirs and include.
   \
    **NOTE:** Because tsconfig does not merge rootDirs and include, you have to copy them from .svelte-kit/tsconfig.json.

    ````json
     {
         "extends": "./.svelte-kit/tsconfig.json",
         "compilerOptions": {
             "rootDirs": [
                 ".",
                 ".svelte-kit/types",
                 ".schemas/types"
             ],
             "allowJs": true,
             "checkJs": true,
             "esModuleInterop": true,
             "forceConsistentCasingInFileNames": true,
             "resolveJsonModule": true,
             "skipLibCheck": true,
             "sourceMap": true,
             "strict": true
         },
         "include": [
             ".schemas/types"
             ".svelte-kit/ambient.d.ts",
             ".svelte-kit/types/**/$types.d.ts",
             "vite.config.ts",
             "src/**/*.js",
             "src/**/*.ts",
             "src/**/*.svelte",
             "src/**/*.js",
             "src/**/*.ts",
             "src/**/*.svelte",
             "tests/**/*.js",
             "tests/**/*.ts",
             "tests/**/*.svelte",
         ],
     }
     ```

    ````

4. **Ambient Types**.
   Just add this `import "kitva/ambient";` on top of your app.d.ts.
   This will type $schemas virtual imports

[WIP]

- [ ] Refactor some code generation code and how the code is organized.
- [ ] Add ability for the user to customize the behavior of submission
- [ ] attachValidation options to skip validation and assign the validation function to locals.validate
- [ ] Input component to render form fields with errors and binding and everything.
- [ ] Improve the docs and some real world examples.
- [ ] (low priority) a debug tool to visualize the form, the schema code, and the data flow.
- [ ] (low priority) Form renderer: automatically render all form fields from the schema.
