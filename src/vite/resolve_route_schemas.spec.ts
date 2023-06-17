import { expect, it } from "vitest";
import { Type as t } from "@sinclair/typebox";
import { resolveRoutesSchemas } from "./resolve_route_schemas.js";

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

	unkown: {},

	actions: {
		default: t.Object({
			a: t.String(),
			b: t.Boolean(),
			c: t.Number({ minimum: 10 })
		})
	}
};
