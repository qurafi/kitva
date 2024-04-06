import type { POSTEvent } from "./schemas.out";

export const POST = async (event: POSTEvent) => {
	return new Response("ok");
};
