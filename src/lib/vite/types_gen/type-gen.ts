import type { Plugin, SchemaBuilder } from "ajv-build-tools";
import path from "path";
import { generateTypes } from "../../typegen/index.js";
import { generate$formDts } from "../client_gen/form.js";
import { copyFile, mkdir, rm, writeFile } from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function typeGenPlugin(): Plugin {
	async function handleFile(builder: SchemaBuilder, file: string) {
		const { root, baseDir } = builder.config;
		const is_route_schema = file.startsWith("routes/");
		const abs_file = path.resolve(root, baseDir, file);
		const root_dir = path.resolve(root, ".schemas/types");
		const base_dir = path.resolve(root_dir, path.dirname(path.relative(root, abs_file)));
		const $form_path = path.resolve(base_dir, "./$form.d.ts");

		await rm(base_dir, { recursive: true, force: true });
		await mkdir(base_dir, { recursive: true });

		const out = path.resolve(
			base_dir,
			is_route_schema ? "schema_types.d.ts" : `${path.basename(abs_file)}_types.d.ts`
		);

		const { code, forms } = await generateTypes(builder, file, is_route_schema);

		// empty file to not break typescript server
		await writeFile(out, code || "");

		if (is_route_schema) {
			const src_$types2 = path.resolve(__dirname, "./$types.template.d.ts");
			await copyFile(src_$types2, path.resolve(base_dir, "$types2.d.ts"));
		}

		if (forms.length) {
			await writeFile($form_path, generate$formDts(forms));
		}
	}

	return {
		async onFile(ctx) {
			if (!ctx.initial) {
				await handleFile(ctx.builder, ctx.relativePath);
			}
		},

		async buildEnd(builder) {
			const root_dir = path.resolve(builder.config.root, ".schemas/types");

			await rm(root_dir, { recursive: true, force: true });

			return Promise.all(
				[...builder.files.keys()].map((file) => {
					return handleFile(builder, file);
				})
			);
		}
	};
}
