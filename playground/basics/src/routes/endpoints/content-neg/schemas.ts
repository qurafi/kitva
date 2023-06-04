export const GET = {
    queries: {
        type: "object",
        properties: {
            a: { type: "string" },
            b: { type: "boolean" },
        },
        required: ["a", "b"],
    },
};
