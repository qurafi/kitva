import { afterAll, beforeAll, it } from "vitest";
import { create } from "create-svelte";
import { readFile, rm, writeFile } from "node:fs/promises";
import path, { basename, relative, resolve } from "node:path";
import { ChildProcess, spawn } from "node:child_process";

const fixtures = [
	{ types: null, template: "default" },
	{ types: null, template: "skeleton" },
	{ types: "checkjs", template: "default" },
	{ types: "checkjs", template: "skeleton" },
	{ types: "typescript", template: "default" },
	{ types: "typescript", template: "skeleton" }
];

function resolve_fixture(types: string | null, template: string) {
	return resolve(__dirname, "fixtures", `${template}-types-${types}-tmp`);
}

for (const fixture of fixtures /* .slice(0, 1) */) {
	const project = resolve_fixture(fixture.types, fixture.template);
	const name = basename(project);
	it.concurrent(
		`setup new kitva project: ${name}`,
		async () => {
			await create(project, {
				name: "test",
				template: fixture.template as any,
				types: fixture.types as any,
				prettier: false,
				eslint: false,
				playwright: false,
				vitest: false
			});

			const pkg_path = resolve(project, "package.json");
			const pkg = JSON.parse(await readFile(pkg_path, "utf-8"));
			(pkg.dependencies ??= {}).kitva = "latest";

			pkg.pnpm = {
				overrides: {
					kitva: "link:" + relative(project, process.cwd())
				}
			};

			await writeFile(pkg_path, JSON.stringify(pkg, null, 2));

			await testFixture(project);
		},
		{ timeout: process.env.CI ? 60000 : 20000, retry: 2 }
	);
}

afterAll(() => {
	processes.forEach((process) => {
		process.kill();
	});
});

const processes: ChildProcess[] = [];

function testFixture(project: string) {
	return new Promise<void>((resolve, reject) => {
		const script = path.resolve(__dirname, "./validate_generated_template.mjs");
		const subprocess = spawn("node", [script], {
			cwd: project,
			stdio: "inherit"
		});
		processes.push(subprocess);
		subprocess.on("error", reject);
		subprocess.on("exit", (code) => {
			if (code !== 0) {
				reject(new Error(`Process stopped with exit code ${code}`));
			}
			resolve();
		});
	});
}

beforeAll(async () => {
	for (const fixture of fixtures) {
		await rm(resolve_fixture(fixture.types, fixture.template), {
			recursive: true,
			force: true
		});
	}
});
