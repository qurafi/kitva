import { expect, it } from "vitest";
import { resolveZodSchemas } from "./resolvers.js";
import z from "zod";
import { Type as t } from "@sinclair/typebox";
import { resolveRoutesSchemas } from "./resolvers.js";

it("should transform zod schemas to json schemas", () => {
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

it("should resolve schemas defined inside a route", () => {
	const resolved = resolveRoutesSchemas(test_module, "test");
	expect(Object.keys(resolved)).toEqual(["GET_queries", "POST_body", "actions_default"]);
});

export const test_module = {
	GET: {
		body: {},
		queries: t.Object(
			{
				a: t.String(),
				b: t.Boolean()
			},
			{
				$$options: {
					x: 1
				}
			}
		)
	},

	POST: {
		body: {
			type: "object"
		}
	},

	unknown: {},

	actions: {
		default: t.Object({
			a: t.String(),
			b: t.Boolean(),
			c: t.Number({ minimum: 10 })
		})
	}
};
