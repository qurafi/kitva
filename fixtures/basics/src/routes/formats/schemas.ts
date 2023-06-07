export const GET = {
    body: {
        type: "string",
        format: "date-time",
    },
};

export const POST = {
    body: {
        type: "string",
        format: "email",
    },
    queries: {
        type: "string",
        format: "regex",
    },
};
