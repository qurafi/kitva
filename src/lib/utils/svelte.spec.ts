import { describe, expect, it } from "vitest";
import { FormData } from "undici";
import { Blob } from "buffer";
import { parseFormData } from "./svelte.js";

it("should remove files from parsed data", () => {
	const form = new FormData();
	form.append("test", "");
	form.append("file", new Blob(["test"]), "test");
	form.append("data", "true");

	const data = parseFormData(form as any);
	expect(Object.keys(data).length).toBe(1);
});

describe("should remove empty field", () => {
	it("basic", () => {
		const form = new FormData();
		form.append("username", "test");
		form.append("username", "");
		form.append("password", "12");
		form.append("photo", new Blob(["test"]), "test");

		const data = parseFormData(form as any);
		expect(Object.keys(data).length).toBe(2);
	});

	it("single field", () => {
		const form = new FormData();
		form.append("test", "");

		const data = parseFormData(form as any);
		expect(Object.keys(data).length).toBe(0);
	});

	it("multiple field", () => {
		const form = new FormData();
		form.append("test", "");
		form.append("test", "");

		const data = parseFormData(form as any);
		expect(Object.keys(data).length).toBe(0);
	});
	it("2 empty - 1 filled", () => {
		const form = new FormData();
		form.append("test", "");
		form.append("test", "");
		form.append("test", "a");

		const data = parseFormData(form as any);
		expect(Object.keys(data).length).toBe(1);
	});
});

it("should group multiple form fields into array", () => {
	const form = new FormData();
	form.append("test", "data");
	form.append("test", "data");

	const data = parseFormData(form as any);
	console.log(data);
});
