import type { Plugin, SchemaBuilder, UpdateType } from "ajv-build-tools";
import path from "node:path";
import { mkdir } from "fs/promises";
import { generateTypes } from "./schemas.js";
import { unlink, writeFile } from "node:fs/promises";
import { default as prettier } from "prettier";

export function typeGenPlugin(): Plugin {
	async function handleFile(builder: SchemaBuilder, file: string, update: UpdateType) {
		const { root, baseDir } = builder.config;
		const is_route_schema = file.startsWith("routes/");

		const schema_dir = path.resolve(root, baseDir, path.dirname(file));
		// const out_dir = is_route_schema ? path.join(schema_dir, "generated") : schema_dir;
		const out_dir = schema_dir;
		mkdir(out_dir, { recursive: true });

		const filename = is_route_schema
			? `schemas.out.ts`
			: `${path.basename(file).replace(/\.(ts|js)$/, "")}.out.ts`;

		const schema_types_out = path.join(out_dir, filename);

		if (update == "remove") {
			await unlink(schema_types_out).catch(() => {
				// Do nothing
			});
			return;
		}
		const result = await generateTypes(builder, file, is_route_schema);

		if (!result) {
			return;
		}

		if (process.env.NODE_ENV != "production") {
			try {
				const prettier_config = await prettier.resolveConfig(schema_types_out, {
					editorconfig: true,
					useCache: true
				});
				result.code = await prettier.format(result.code, {
					parser: "typescript",
					...prettier_config
				});
			} catch (e) {
				// do nothing
			}
		}

		await writeFile(schema_types_out, result.code);
	}

	return {
		async onFile(ctx) {
			if (!ctx.initial) {
				await handleFile(ctx.builder, ctx.relativePath, "add");
			}
		},

		async buildEnd(builder) {
			return Promise.all(
				[...builder.files.keys()].map((file) => {
					return handleFile(builder, file, "add");
				})
			);
		}
	};
}
