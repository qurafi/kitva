import { expect, it, describe } from "vitest";
import { resolveZodSchemas, routeSchemasResolver } from "./resolvers.js";
import z from "zod";
import { Type as t } from "@sinclair/typebox";

it("should transform zod schemas to json schemas", () => {
	const { transformSchema } = resolveZodSchemas();
	expect(
		transformSchema(
			z.object({
				a: z.string(),
				b: z.boolean()
			})
		)
	).toMatchObject({
		type: "object",
		properties: { a: { type: "string" }, b: { type: "boolean" } },
		required: ["a", "b"]
	});

	// undefined=no transformation
	expect(transformSchema({ type: "object", properties: { a: { type: "number" } } })).toBe(
		undefined
	);
});

describe("should resolve schemas defined inside a route", () => {
	const { resolveModule, resolveSchema } = routeSchemasResolver();

	function resolveSchemas(mod: any) {
		const resolved = resolveModule(mod, "routes/test") as Record<string, any>;
		for (const [name, schema] of Object.entries(resolved)) {
			resolved[name] = resolveSchema(schema, "routes/test", name) ?? schema;
		}
		return resolved;
	}

	const resolved = resolveSchemas(test_module);

	it("should resolve route schemas into correct shape", () => {
		const keys = Object.keys(resolved);
		expect(keys).toEqual(
			expect.arrayContaining(["GET_queries", "POST_body", "actions_default"])
		);

		expect(resolved.unknown).toBeUndefined();
	});

	invalid_modules.forEach((mod, i) => {
		it(`throw on invalid schema types - case ${i}`, () => {
			expect(() => resolveSchemas(mod as any)).toThrow(
				/(must be a type of object)|(must be object)/
			);
		});
	});

	it("should set type=object by default for actions,headers,queries, and params", () => {
		expect(resolved.GET_headers.type).toBe("object");
		expect(resolved.GET_params.type).toBe("object");
		expect(resolved.GET_queries.type).toBe("object");
		expect(resolved.actions_another.type).toBe("object");

		// should not override body type
		expect(resolved.PATCH_body.type).toBe("string");
	});

	it("should not have body schema for GET method", () => {
		expect(resolved.GET_body).toBeUndefined();
	});

	it("should set additionalProperties=false for body(type=object), headers, queries, and form actions by default", () => {
		// JSON Schema allows additionalProperties by default
		expect(resolved.GET_queries.additionalProperties).toBeUndefined();
		expect(resolved.GET_headers.additionalProperties).toBeUndefined();

		expect(resolved.GET_params.additionalProperties).toBe(false);

		// body when type="object"
		expect(resolved.POST_body.additionalProperties).toBe(false);

		// body when type!=object
		expect(resolved.PATCH_body.additionalProperties).toBeUndefined();

		// actions additionalProperties is false by default
		expect(resolved.actions_default.additionalProperties).toBe(false);
		expect(resolved.actions_another.additionalProperties).toBe(false);

		// explicitly set, should not override
		expect(resolved.actions_additional.additionalProperties).toBe(true);
		expect(resolved.PATCH_queries.additionalProperties).toBe(false);
	});
});

export const test_module = {
	GET: {
		// should be GET_queries
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
		),

		// should throw warning
		body: {},

		// should be type=object, additionalProperties=false by default
		headers: {},
		params: {}
	},

	POST: {
		body: {
			// should additionalProperties to false
			type: "object",
			properties: {
				foo: { type: "string" }
			}
		}
	},

	PATCH: {
		body: {
			// should not set additionalProperties
			type: "string"
		},

		queries: {
			// should not override additionalProperties
			additionalProperties: false
		}
	},

	// unknowns stripped
	unknown: {},

	// actions schemas mapped to action_name=schema
	actions: {
		default: t.Object({
			a: t.String(),
			b: t.Boolean(),
			c: t.Number({ minimum: 10 })
		}),

		// should set default object type to object and additionalProperties to false
		another: {},

		additional: {
			// should not override additionalProperties
			additionalProperties: true
		}
	}
};

const invalid_modules = [
	{
		actions: {
			wrong_type: {
				type: "string"
			}
		}
	},
	{ POST: { queries: { type: "string" } } },
	{ POST: { params: { type: "string" } } },
	{ POST: { headers: { type: "string" } } },
	{ POST: "wrong" },
	{ POST: { body: "wrong" } },
	{ actions: "wrong" },
	{ actions: { default: "wrong" } }
];
