import { afterAll, beforeAll, it } from "vitest";
import { create } from "create-svelte";
import { rm } from "node:fs/promises";
import path, { basename, relative, resolve } from "node:path";
import { ChildProcess, execSync, spawn } from "node:child_process";

const fixtures = <const>[
	{ types: null, template: "default" },
	{ types: null, template: "skeleton" },
	{ types: "checkjs", template: "default" },
	{ types: "checkjs", template: "skeleton" },
	{ types: "typescript", template: "default" },
	{ types: "typescript", template: "skeleton" }
];

for (const fixture of fixtures /* .slice(0, 1) */) {
	const project = resolve_fixture(fixture.types, fixture.template);
	const name = basename(project);

	it.concurrent(
		`setup new kitva project: ${name}`,
		{ timeout: process.env.CI ? 60000 : 20000, retry: 0 },
		async () => {
			await rmProject(project);

			await create(project, {
				name: "test",
				template: fixture.template,
				types: fixture.types,
				prettier: false,
				eslint: false,
				playwright: false,
				vitest: false,
				svelte5: false
			});

			const kitva_path = relative(project, process.cwd());

			execSync(`pnpm link ${kitva_path} && pnpm kitva -y`, {
				cwd: project
			});

			await testFixture(project);

			await rmProject(project);
		}
	);
}

function resolve_fixture(types: string | null, template: string) {
	return resolve(__dirname, "fixtures", `${template}-types-${types}-tmp`);
}

async function rmProject(project: string) {
	try {
		await rm(project, { recursive: true, force: true });
	} catch (e) {
		console.error("failed to rm", project);
	}
}

const processes: ChildProcess[] = [];

function testFixture(project: string) {
	return new Promise<void>((resolve, reject) => {
		const script = path.resolve(__dirname, "./validate_generated_template.js");
		const subprocess = spawn("node", [script], {
			cwd: project
		});
		subprocess.stdout.on("data", (chunk) => {
			console.log("Subprocess:", chunk.toString("utf-8"));
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

afterAll(() => {
	processes.forEach((process) => {
		process.kill();
	});
});

beforeAll(async () => {
	for (const fixture of fixtures) {
		await rm(resolve_fixture(fixture.types, fixture.template), {
			recursive: true,
			force: true
		});
	}
});
