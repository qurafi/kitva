import { describe, expect, it } from "vitest";
import { editTsConfig } from "../edit_tsconfig.js";

const sk_config = `{
	"compilerOptions": {
		"paths": {
			"$lib": [
				"../src/lib"
			],
			"$lib/*": [
				"../src/lib/*"
			]
		},
		"rootDirs": [
			"..",
			"./types"
		],
		"importsNotUsedAsValues": "error",
		"isolatedModules": true,
		"preserveValueImports": true,
		"lib": [
			"esnext",
			"DOM",
			"DOM.Iterable"
		],
		"moduleResolution": "node",
		"module": "esnext",
		"target": "esnext",
		"ignoreDeprecations": "5.0"
	},
	"include": [
		"ambient.d.ts",
		"./types/**/$types.d.ts",
		"../vite.config.ts",
		"../src/**/*.js",
		"../src/**/*.ts",
		"../src/**/*.svelte",
		"../tests/**/*.js",
		"../tests/**/*.ts",
		"../tests/**/*.svelte"
	],
	"exclude": [
		"../node_modules/**",
		"./[!ambient.d.ts]**",
		"../src/service-worker.js",
		"../src/service-worker.ts",
		"../src/service-worker.d.ts"
	]
}`;
describe("editTsconfig", () => {
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

		with_root_dir_already: `{
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

		with_root_dir_already_lines: `{
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
            ,
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

		with_include_another_thing: `{
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
    },
    "include": ["something"]
    // Path aliases are handled by https://kit.svelte.dev/docs/configuration#alias
    //
    // If you want to overwrite includes/excludes, make sure to copy over the relevant includes/excludes
    // from the referenced tsconfig.json - TypeScript does not merge them in
}
`,
		with_include_another_thing_no_root_dirs: `{
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
    },
    "include": ["something"]
    // Path aliases are handled by https://kit.svelte.dev/docs/configuration#alias
    //
    // If you want to overwrite includes/excludes, make sure to copy over the relevant includes/excludes
    // from the referenced tsconfig.json - TypeScript does not merge them in
}
`,

		already_copied: `{
    "extends": "./.svelte-kit/tsconfig.json",
    "compilerOptions": {
        "rootDirs": [
            ".",
            ".svelte-kit/types",
            ".schemas/types",
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
        "tests/**/*.svelte"
    ]
    // Path aliases are handled by https://kit.svelte.dev/docs/configuration#alias
    //
    // If you want to overwrite includes/excludes, make sure to copy over the relevant includes/excludes
    // from the referenced tsconfig.json - TypeScript does not merge them in
}
`,
		already_copied_but_modified: `{
    "extends": "./.svelte-kit/tsconfig.json",
    "compilerOptions": {
        "rootDirs": [
            ".",
            ".svelte-kit/types",
            ".schemas/types",
            "userRootDir"
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
        "tests/**/*.svelte"
    ]
    // Path aliases are handled by https://kit.svelte.dev/docs/configuration#alias
    //
    // If you want to overwrite includes/excludes, make sure to copy over the relevant includes/excludes
    // from the referenced tsconfig.json - TypeScript does not merge them in
}
`
	};

	for (const [name, content] of Object.entries(fixtures)) {
		it(`should edit tsconfig config correctly: ${name}`, async () => {
			const result = await editTsConfig(content, sk_config);
			// console.log(name, content, "\n\n", result);
			expect(result).toMatchSnapshot();
		});
	}
});
