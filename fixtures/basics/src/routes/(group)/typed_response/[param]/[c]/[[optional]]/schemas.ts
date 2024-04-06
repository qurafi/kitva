import { z } from "zod";

export const POST = {
	body: z.object({
		a: z.string()
	}),
	queries: z.object({
		a: z.string()
	}),
	headers: z.object({
		authorization: z.string()
	})
};

export const PUT = {
	body: z.object({
		put: z.string()
	})
};
