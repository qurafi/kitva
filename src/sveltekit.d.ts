declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			validation?: import("./types.js").ValidationResults;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
