export const POST = {
	body: {
		type: "object",
		properties: {
			a: { type: "string" }
		},
		required: ["a"]
	}
};

export const GET = {
	headers: {
		type: "object",
		properties: {
			a: { type: "string" }
		},
		required: ["a"]
	}
};
