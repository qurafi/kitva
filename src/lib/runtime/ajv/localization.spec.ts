import { expect, test } from "vitest";
import { acceptLanguage } from "./localization.js";

test("parse accept language header", () => {
	const tests = [
		["fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5", "fr-ch"],
		["fr-CH;q=0.9, fr;q=1, en;q=0.8, de;q=0.7, *;q=0.5", "fr"],
		["*", "en"],
		["en-US,en;q=0.5", "en-us"],
		["en-US;q=0.5,en;q=1", "en"]
	];

	for (const [str, expected] of tests) {
		expect(acceptLanguage(str)).toBe(expected);
	}
});
