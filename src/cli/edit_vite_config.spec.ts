import { expect, it } from "vitest";
import { editViteConfig } from "./edit_vite_config.js";

const fixtures = {
    empty: "",
    default_file: `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()]
});`,

    file_with_plugins_0: `import somePlugin from "vite-plugin"
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), somePlugin()]
});`,

    file_with_plugins_0_lines: `import somePlugin from "vite-plugin"
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
        sveltekit(),
        somePlugin()
    ]
});`,

    file_with_plugins_1: `import somePlugin from "vite-plugin"
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [somePlugin(), sveltekit()]
});`,
    file_with_plugins_1_lines: `import somePlugin from "vite-plugin"
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
        somePlugin(),
        sveltekit()
    ]
});`,
};

for (const [name, content] of Object.entries(fixtures)) {
    it(`should edit vite config correctly: ${name}`, () => {
        const result = editViteConfig(content);
        expect(result).toMatchSnapshot();
    });
}
