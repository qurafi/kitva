import * as fns from "$schemas/routes/test/schemas";
// import * as fns from "./compiled_schemas.js";

export const GET: RequestHandler = async () => {
    console.log({ fns });
    return new Response("ok");
};
