import { expect, it } from "vitest";
import { editTsConfig } from "../edit_tsconfig.js";

const fixtures = {
    empty: "",
    empty_obj: "{}",
    default_file: `{
    "extends": "./.svelte-kit/tsconfig.json",
    "compilerOptions": {
        "allowJs": true,
        "checkJs": true,
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "skipLibCheck": true,
        "sourceMap": true,
        "strict": true
    }
    // Path aliases are handled by https://kit.svelte.dev/docs/configuration#alias
    //
    // If you want to overwrite includes/excludes, make sure to copy over the relevant includes/excludes
    // from the referenced tsconfig.json - TypeScript does not merge them in
}
`,

    already_edited: `{
    "extends": "./.svelte-kit/tsconfig.json",
    "compilerOptions": {
        "rootDirs": [".", ".svelte-kit/types", ".schemas/types"],
        "allowJs": true,
        "checkJs": true,
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "skipLibCheck": true,
        "sourceMap": true,
        "strict": true
    }
    // Path aliases are handled by https://kit.svelte.dev/docs/configuration#alias
    //
    // If you want to overwrite includes/excludes, make sure to copy over the relevant includes/excludes
    // from the referenced tsconfig.json - TypeScript does not merge them in
}
`,

    already_edited_lines: `{
    "extends": "./.svelte-kit/tsconfig.json",
    "compilerOptions": {
        "rootDirs": [
            ".",
            ".svelte-kit/types",
            ".schemas/types",
            "userRootDir",
        ],
        "allowJs": true,
        "checkJs": true,
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "skipLibCheck": true,
        "sourceMap": true,
        "strict": true
    }
    // Path aliases are handled by https://kit.svelte.dev/docs/configuration#alias
    //
    // If you want to overwrite includes/excludes, make sure to copy over the relevant includes/excludes
    // from the referenced tsconfig.json - TypeScript does not merge them in
}
`,
    invalid_syntax: `{
    "extends": "./.svelte-kit/tsconfig.json",
    "compilerOptions": {
        "rootDirs": [
            ".",
            ".svelte-kit/types",
            ".schemas/types",
            "userRootDir",
        ],
        "allowJs": true,
        "checkJs": true,
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "skipLibCheck": true,
        "sourceMap": true,
        "strict": true
    }
    // Path aliases are handled by https://kit.svelte.dev/docs/configuration#alias
    //
    // If you want to overwrite includes/excludes, make sure to copy over the relevant includes/excludes
    // from the referenced tsconfig.json - TypeScript does not merge them in
}
`,
};

for (const [name, content] of Object.entries(fixtures)) {
    it(`should edit tsconfig config correctly: ${name}`, () => {
        const result = editTsConfig(content);
        expect(result).toMatchSnapshot();
    });
}
