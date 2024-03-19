export const POST = {
	body: {
		type: "string"
	}
};

export const actions = {
	default: {
		type: "object",
		properties: {
			a: { type: "string" }
		},
		required: ["a"]
	}
};
