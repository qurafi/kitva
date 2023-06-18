import type { POSTHandler } from "./$types2";

export const POST: POSTHandler = async () => {
	return new Response("ok");
};
