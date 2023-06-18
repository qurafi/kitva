import { expect, test } from "@playwright/test";

test("should pass with correct data", async ({ request }) => {
	const response = await request.post("/endpoints/standalone", {
		data: {
			a: "1",
			b: true,
			c: {
				a: true
			}
		}
	});

	console.log(response);

	expect(response.ok()).toBeTruthy();
});

test("should not pass with incorrect data", async ({ request }) => {
	const response = await request.post("/endpoints/standalone", {
		data: {}
	});

	console.log(response);

	expect(response.ok()).toBe(false);
	await expect(response.json()).resolves.toEqual({
		error: "Bad Request",
		code: "VALIDATION_ERROR",
		message: "body must have required property 'a'"
	});
	// await expect(page.getByRole('heading', { name: 'Welcome to SvelteKit' })).toBeVisible();
});

test("content negotiation validation: invalid data", async ({ request }) => {
	const response = await request.get("/endpoints/content-neg", {
		headers: {
			accept: "*/*"
		}
	});

	expect.soft(response.status()).toBe(400);
	await expect(response.json()).resolves.toEqual({
		error: "Bad Request",
		code: "VALIDATION_ERROR",
		message: "queries must have required property 'a'"
	});
});

test("content negotiation validation: valid data", async ({ request }) => {
	const response = await request.get("/endpoints/content-neg", {
		params: {
			a: "a",
			b: true
		},
		headers: {
			accept: "*/*"
		}
	});

	expect(response.status()).toBe(200);
	await expect(response.text()).resolves.toEqual("endpoint");
});

test("content negotiation: render html", async ({ request }) => {
	const response = await request.get("/endpoints/content-neg", {
		headers: {
			accept: "text/html"
		}
	});

	expect(response.status()).toBe(200);
	await expect(response.text()).resolves.toContain("<h1>Page</h1>");
});
