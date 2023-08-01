import { z } from "zod";

export const actions = {
	default: z.object({
		interests: z.string().array()
	})
};
