import { text } from "@sveltejs/kit";
import type { POSTEvent } from "./schemas.out";

export const POST = async (event: POSTEvent) => {
	return text("ok");
};
