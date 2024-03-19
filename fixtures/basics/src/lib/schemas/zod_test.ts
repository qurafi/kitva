import z from "zod";

export const test = z.object({
	a: z.number(),
	b: z.object({
		a: z.number(),
		b: z.object({
			c: z.string()
		})
	})
});
