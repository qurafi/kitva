import { expect, test } from "@playwright/test";

test("should add property to the input before validation", async ({ page }) => {
	await page.goto("validation_hooks/form");

	await page.locator("[name='username']").fill("admin");
	await page.locator("[name='password']").fill("secret");
	await page.getByRole("button").click();

	const content = await page.locator("pre").textContent();

	const json = JSON.parse(content ?? "{}");

	expect(json).toHaveProperty("success");
	expect(json?.input).toHaveProperty("filled_by_server");
	expect(json?.input).not.toHaveProperty("password");
	expect(json).not.toHaveProperty("__form_default");
});

test("should add property to the input before validation: invalid data", async ({ page }) => {
	await page.goto("validation_hooks/form");

	await page.locator("[name='username']").fill("admin");
	await page.getByRole("button").click();

	const content = await page.locator("pre").textContent();

	const json = JSON.parse(content ?? "{}");

	expect(json).not.toHaveProperty("success");
	expect(json?.__form_default?.input).toHaveProperty("filled_by_server");
	expect(json?.__form_default?.errors).toHaveProperty("password");
});

test("should skip validation", async ({ page }) => {
	await page.goto("validation_hooks/form?novalidate");

	await page.locator("[name='username']").fill("admin");
	await page.getByRole("button").click();

	const content = await page.locator("pre").textContent();

	const json = JSON.parse(content ?? "{}");

	expect(json).toHaveProperty("success");
	// expect(json?.__form_default?.input).toHaveProperty("filled_by_server");
	// expect(json?.__form_default?.errors).toHaveProperty("password");
});

test("should return expected form failure message when password is 123456", async ({ page }) => {
	await page.goto("validation_hooks/form");

	await page.locator("[name='username']").fill("admin");
	await page.locator("[name='password']").fill("123456");
	await page.getByRole("button").click();

	const content = await page.locator("pre").textContent();

	const json = JSON.parse(content ?? "{}");

	expect(json?.__form_default?.errors).toMatchObject({
		password: {
			message: "password should not be 123456"
		}
	});
});

test("should return global form error message", async ({ page }) => {
	await page.goto("validation_hooks/form");

	await page.locator("[name='username']").fill("admin");
	await page.locator("[name='password']").fill("wrong");
	await page.getByRole("button").click();

	const content = await page.locator("pre").textContent();

	const json = JSON.parse(content ?? "{}");

	expect(json?.__form_default?.errors).toMatchObject({
		$$error: {
			message: "username or password is invalid"
		}
	});
});
