# Kitva - Validation Kit for Sveltekit

Validate your endpoints and forms with no boilerplate, Just define your **schemas.ts** alongside your routes and this tool will take care of validation, type generation and form client generation.

## Showcase
https://github.com/qurafi/kitva/assets/15172611/839dea17-95f2-476d-8b5f-f90dd12ce77d


## Table of Content

- [Kitva - Validation Kit for Sveltekit](#kitva---validation-kit-for-sveltekit)
  - [Showcase](#showcase)
  - [Table of Content](#table-of-content)
  - [Features](#features)
  - [Get Started](#get-started)
    - [Schema format](#schema-format)
    - [Defining Schemas](#defining-schemas)
      - [Example of an endpoint schema file](#example-of-an-endpoint-schema-file)
      - [Type builders](#type-builders)
      - [Form actions](#form-actions)
    - [Validation Hooks](#validation-hooks)
    - [Standalone Validation](#standalone-validation)
    - [CLI options](#cli-options)
    - [Manual Setup](#manual-setup)

## Features

- **Standard**: Uses Json Schema standard as the default schema format.
- **Performance**: Compiles your schemas into highly optmized validation code, thanks to Ajv.
- **Less boilerplate**: Endpoints and forms are automatically validated by a global Sveltekit hook.
- **Small bundle sizes**: Just your validation function and the form client and nothing else!
- **Typesafety**: Types are automatically generated and handled for you.
- **Fully featured form client**: Just import `./$form` inside your page and your form client is ready to use. With features including:
  - Fully typed, No need to bring types with you.
  - Save your form in session storage.
  - Warning before navigating away.
  - Form input components ready to use with binding and errors all set
  - and more.
- **Zod compatibility**: Zod schemas are converted to Json Schemas out of the box.

## Get Started

**NOTE**: This is still in alpha. If you have any issue or feedback, please raise a new issue.

`npm i kitva ajv ajv-formats@beta`

`pnpm i kitva ajv ajv-formats@beta`

And then run this command to setup everything:

`npm run kitva`

`pnpm kitva`

After that, you may need to restart your typescript server.

**NOTE:** This command will edit your vite config, tsconfig and create $lib/validation/hook file, so it's recommended to commit your work.

For more information: See [Manual setup](#manual-setup), [CLI Options](#cli-options)

### Schema format

Json schemas are used as the default schema format and it's managed by Ajv. Althought we kinda made it possible to use other formats, but we currently only focus on json schemas.

For more information about using Json Schemas. Consult one of the following links:

- [Ajv docs](https://ajv.js.org/json-schema.html)
- [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/)
- [JSON Schema Spec Draft-07](https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-00)

**NOTE**: This library does not handle any schema compilation or any schema specific logic. It uses [ajv-build-tools](https://github.com/qurafi/ajv-tools) plugin under the hood to manage the compilation. If you have any issue regarding compilation, please open issue there.

### Defining Schemas

There's two kind of schema files:

- A shared one defined in `$lib/schemas`.
- A route schema which included with some enhancement for endpoints and forms.

#### Example of an endpoint schema file

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

And that's it. Your endpoint will automatically validated. To get the parsed data use the `event.locals.validation.*`

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

#### Type builders

You could use some type builders such as [Zod](https://github.com/colinhacks/zod)<sup>1</sup>, [Fluent-Json-Schema](https://github.com/fastify/fluent-json-schema) and [TypeBox](https://github.com/sinclairzx81/typebox)<sup>2</sup> to make life easier:

```typescript
import { Type as t } from "@sinclair/typebox";
import { z } from "zod";

// TypeBox
const UserLoginSchemaTypeBox = t.Object(
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
);

// or with Zod
const UserLoginSchemaZod = z.object({
 username: z.string().min(3).max(36),
 password: z.string().min(6).max(128),
 email: z.string().min(6).max(100).email()
});

export const POST = {
 body: UserLoginSchemaTypeBox,
//  body: UserLoginSchemaZod,
};
```

**1:** Zod schemas are converted to json schema using [zod-to-json-schema](https://github.com/StefanTerdell/zod-to-json-schema). Not all features are supported and the validation and compilation still backed by Ajv. Although it should work fine for most of schemas.

**2:** TypeBox supports type inference but currently all schemas are converted to types by [json-schema-to-typescript](https://github.com/bcherny/json-schema-to-typescript).

#### Form actions

```typescript
/* routes/api/login
    +page.svelte
    +page.server.ts
    schemas.ts
*/
export const actions = {
    signup: {
        // must be type object and additionalProperties turned off
        type:"object",
        additionalProperties: false,
        properties: {
            a: {type:"string"},
            b: {type:"boolean", default:false},
        },
        // must set required
        required: ["a", "b"]
    },
    // or simply with zod, TypBox, etc.
    signup: z.object({
        a: z.string(),
        b: z.boolean().default(false).
    })

}
```

This will require aditional step by calling withValidation as there's no current possible way to intercept and change form result in Sveltekit:

```typescript
import { withValidation } from "kitva/hooks";
// NOTE: use $types2
import type { Actions } from "./$types2";

export const actions: Actions = withValidation({
    signup(event) {
        // access form data from event.locals and it's type safe!
        event.locals.validation.body.a

        return {
            success: true,
        };
    },
    another: ..., // TS error, unknown prop
});
```

**Using the client:**

To use the client, simply import `./$form`. The types will be automatically handled.

All clients are exported by the format, `action_name = createActionNameForm`, e.g., `default = createDefaultForm`.

```svelte
<script>
 import { createDefaultForm } from "./$form";

 const my_form = createDefaultForm({fields: initial_fields});

 const { fields, errs, action, action_url } = my_form;
</script>

<form method="post" action={action_url}>
 <label>
  Username
  <input type="text" name="username" autocomplete="username" bind:value={$fields.username} />
  {#if $errs.username}
   <p class="error">{$errs.username}</p>
  {/if}
 </label>

 <!-- or simply use Input from kitva/components -->
 <Input form={my_form} name="username"/>
 ...
</form>
```

For more information about the client see [forms/types.ts](./src/lib/forms/types.ts)


### Validation Hooks

To change the behavior of validation, use handleValidate from `kitva/hooks`.
```typescript
handleValidate(actions.default, async ({ event, input, validate }) => {

 if (input.body) {
  input.body.filled_by_server = "filled by server";
 }

 await validate();

 delete input.body.password;

//  return false to cancel the validation
//  return false
});

```

Note that if you don't call validate. In production, it will be called for you, but in dev mode, an error will be thrown. This to prevent security issues when forgetting to call validate.



### Standalone Validation

To directly import and use the compiled validation functions. refer to [ajv-build-tools](https://github.com/qurafi/ajv-tools#importing-the-compiled-schemas)

### CLI options

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

    import { validationHook } from "kitva/hooks";
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
