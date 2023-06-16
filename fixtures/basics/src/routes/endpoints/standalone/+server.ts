import type { POSTHandler } from "./$types2";

export const POST: POSTHandler = async (event) => {
	return new Response("ok");
};
