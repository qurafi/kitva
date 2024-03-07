import { expect, it } from "vitest";
import z from "zod";
import { resolveZodSchemas } from "./resolve_zod_schemas.js";
it("should transform zod schemas to json schemsa", () => {
	const resolver = resolveZodSchemas();
	const schemas = [
		[
			z.object({
				a: z.string(),
				b: z.boolean()
			}),
			{ type: "object", properties: { a: { type: "string" }, b: { type: "boolean" } } }
		],
		[z.string().startsWith("zod", "should start with zod"), { type: "string" }],
		[z.string().datetime(), { type: "string" }],
		[z.string().ip(), { type: "string" }],
		[z.number().int("should be integer"), { type: "integer" }],
		[z.number().multipleOf(5), { type: "number" }],
		[z.set(z.number()), { type: "array", items: { type: "number" }, uniqueItems: true }],
		[
			{ type: "object", properties: { a: { type: "number" } } },
			{ type: "object", properties: { a: { type: "number" } } }
		]
	];

	for (const [schema, expected] of schemas) {
		const result = resolver.resolveSchema(schema);
		console.dir({ result }, { depth: null });
		expect(result).toMatchObject(expected);
	}
});
