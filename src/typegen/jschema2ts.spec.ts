import { expect, test } from "vitest";
import Ajv from "ajv";
import { compileJsonSchemaTypes } from "./jschema2ts.js";

const schemas = {
	a: {
		$id: "file://schemas/a.json",
		type: "object",
		properties: {
			a: { type: "string" },
			b: { $ref: "file://schemas/b.json" }
		}
	},
	b: {
		type: "object",
		$id: "file://schemas/b.json",
		properties: {
			c: { type: "string" }
		}
	},

	c: {
		type: "object",
		$id: "file://schemas/ref/c.json",
		properties: {
			prop: { $ref: "../b.json" }
		}
	},

	d: {
		type: "object",
		$id: "file://schemas/ref/d.json",
		properties: {
			c: { $ref: "c.json" },
			d_a: { $ref: "#/definitions/d_a" }
		},
		definitions: {
			d_a: {
				type: "string"
			}
		}
	}
};

const ajv = new Ajv.default({
	schemas
});

test("test compilation from json schema to typescript", async () => {
	const code = await compileJsonSchemaTypes(ajv, "Test", schemas.d);
	expect(code).toMatchInlineSnapshot(`
      "type DA= string

      export interface Test {
      c?: FileSchemasRefCJson
      d_a?: DA
      [k: string]: any
      }
      interface FileSchemasRefCJson{
      prop?: FileSchemasBJson
      [k: string]: any
      }
      interface FileSchemasBJson{
      c?: string
      [k: string]: any
      }
      "
    `);
});

//TODO more complex testing for refs?
