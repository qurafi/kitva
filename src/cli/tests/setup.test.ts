import { afterAll, beforeAll, it } from "vitest";
import { create } from "create-svelte";
import { readFile, rm, writeFile } from "fs/promises";
import path, { basename, relative, resolve } from "path";
import { ChildProcess, spawn } from "child_process";
import { cwd } from "process";

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

async function testSetup(types: string | null, template: string) {
	const out = resolve_fixture(types, template);
	await create(out, {
		name: "test",
		template: template,
		types: types,
		prettier: false,
		eslint: false,
		playwright: false,
		vitest: false
	});

	// await setup(out);
}

for (const fixture of fixtures /* .slice(1) */) {
	const project = resolve_fixture(fixture.types, fixture.template);
	const name = basename(project);
	it.concurrent(
		`setup new kitva project: ${name}`,
		async () => {
			await testSetup(fixture.types, fixture.template);

			const pkg_path = resolve(project, "package.json");
			const pkg = JSON.parse(await readFile(pkg_path, "utf-8"));
			(pkg.dependencies ??= {}).kitva = "^1.0.0-next";

			pkg.pnpm = {
				overrides: {
					kitva: "link:" + relative(project, cwd())
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
