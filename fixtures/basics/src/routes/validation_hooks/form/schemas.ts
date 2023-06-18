export const actions = {
	default: {
		type: "object",
		properties: {
			username: { type: "string" },
			password: { type: "string" },
			filled_by_server: { type: "string" }
		},
		required: ["username", "password", "filled_by_server"]
	}
};
