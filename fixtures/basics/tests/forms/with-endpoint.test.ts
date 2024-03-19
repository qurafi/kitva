import { expect, test } from "@playwright/test";
import { fetch } from "undici";
const test_data = {
	POST: {
		valid: "some text",
		invalid: { prop: "" }
	},

	action_default: {
		valid: {
			a: "string"
		},
		invalid: {}
	}
};

test("should validate the endpoint alongside form actions: invalid data", async ({ baseURL }) => {
	const response = await fetch(baseURL + "/form/with-endpoint", {
		method: "POST",
		body: JSON.stringify(test_data.POST.invalid),
		headers: {
			"content-type": "application/json"
		}
	});

	expect(response.status).toBe(400);
	expect(await response.json()).toMatchObject({
		message: "body must be string",
		code: "VALIDATION_ERROR"
	});
});

test("should validate the endpoint alongside form actions: valid data", async ({ baseURL }) => {
	const response = await fetch(baseURL + "/form/with-endpoint", {
		method: "POST",
		body: `"${test_data.POST.valid}"`,
		headers: {
			"content-type": "application/json"
		}
	});

	expect(response.status).toBe(200);
	expect(await response.text()).toBe("ok");
});

test("form submission: invalid data", async ({ baseURL, request }) => {
	const response = await request.post("/form/with-endpoint", {
		form: test_data.action_default.invalid,

		headers: {
			origin: baseURL!,
			accept: "text/html"
		}
	});

	expect(response.headers()["content-type"]).toContain("text/html");

	const text = await response.text();
	expect(text).toContain("must have required property");
});

test("form submission: valid", async ({ baseURL, request }) => {
	const response = await request.post("/form/with-endpoint", {
		form: test_data.action_default.valid,

		headers: {
			origin: baseURL!,
			accept: "text/html"
		}
	});

	expect(response.status()).toBe(200);
	expect(response.headers()["content-type"]).toContain("text/html");

	// too lazy to check
	expect(await response.text()).toContain('"success": true');
});
