import { text } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async () => {
    console.log("POST");
    return text("ok");
};
