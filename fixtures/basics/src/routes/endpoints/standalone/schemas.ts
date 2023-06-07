export const POST = {
    body: {
        type: "object",
        properties: {
            a: { type: "string" },
            b: { type: "boolean" },
        },
        required: ["a", "b"],
    },
};
