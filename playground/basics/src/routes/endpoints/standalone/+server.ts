import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async () => {
    return new Response("ok");
};
