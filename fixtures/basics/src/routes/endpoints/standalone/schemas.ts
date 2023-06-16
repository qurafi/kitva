export const POST = {
	body: {
		type: "object",
		properties: {
			a: { type: "string" },
			b: { type: "boolean" },
			c: {
				type: "object",
				properties: {
					a: { type: "boolean" }
				},
				required: ["a"],

				additionalProperties: false
			}
		},
		required: ["a", "b", "c"]
	}
};
