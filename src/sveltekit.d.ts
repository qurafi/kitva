import type { Localize } from "$lib/index.ts";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			validation?: import("./lib/types.js").ValidationResults & {
				localize?: Localize;
			};
			action?: string;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
