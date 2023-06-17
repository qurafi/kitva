export const actions = {
	validated: {
		//TODO validate actions schema to only allow 1D objects
		type: "object",
		properties: {
			a: { type: "string" }
		},
		required: ["a"]
	}
};
