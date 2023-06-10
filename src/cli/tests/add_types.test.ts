import { expect, it } from "vitest";
import { editAppDts } from "../add_types.js";

const fixtures = {
    default: `// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface Platform {}
    }
}

export {};`,
    with_locals: `// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            user: {name:string, id:string}
        }
        // interface PageData {}
        // interface Platform {}
    }
}

export {};`,
    with_locals_inline: `// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {user: {name:string, id:string}}
        // interface PageData {}
        // interface Platform {}
    }
}

export {};`,
    already_defined_inline: `// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {validation: import("kitva/presets/ajv/index").AppLocal;}
        // interface PageData {}
        // interface Platform {}
    }
}

export {};`,
    already_defined: `// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            validation: import("kitva/presets/ajv/index").AppLocal;
        }
        // interface PageData {}
        // interface Platform {}
    }
}

export {};`,
};

for (const [name, content] of Object.entries(fixtures)) {
    it(`should edit app.d.ts file correctly: ${name}`, () => {
        const result = editAppDts(content);
        expect(result).toMatchSnapshot();
    });
}
