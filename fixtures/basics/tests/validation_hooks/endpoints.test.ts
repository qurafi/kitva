import { expect, test } from "@playwright/test";

test("should add property to the input before validation", async ({ request }) => {
	const response = await request.post("validation_hooks/endpoint", {
		data: {
			username: "test",
			password: "test"
		}
	});

	const response_data = await response.json();

	expect(response.status()).toBe(200);
	expect(response_data.your_input).toHaveProperty("filled_by_server");
	expect(response_data.your_input).not.toHaveProperty("password");
});

test("should skip validation on endpoints", async ({ request }) => {
	const response = await request.post("validation_hooks/endpoint?novalidate", {
		data: {
			username: "test"
			// password: "test"
		}
	});

	const response_data = await response.json();

	expect(response.status()).toBe(200);
	expect(response_data).toEqual({});
});
