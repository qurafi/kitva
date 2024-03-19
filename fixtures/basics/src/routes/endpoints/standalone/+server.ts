import type { POSTHandler } from "./generated/types";

export const POST: POSTHandler = async (event) => {
	return new Response("ok");
};
