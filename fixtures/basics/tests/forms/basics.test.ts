import { expect, test } from "@playwright/test";
import { setTimeout } from "timers/promises";

const form_errors = {
	username: {
		message: "username.invalid"
	},
	first_name: {
		message: "must have required property 'first_name'"
	},
	email: {
		message: "email is not valid"
	}
};

async function testFormSubmission({
	javascript,
	valid_data,
	enhance
}: {
	javascript: boolean;
	valid_data: boolean;
	enhance: boolean;
}) {
	const valid = valid_data ? "valid" : "invalid";
	test(`validate form javascript=${javascript} with ${valid} data with enhance=${enhance}`, async ({
		browser
	}) => {
		const context = await browser.newContext({
			javaScriptEnabled: javascript
		});
		const page = await context.newPage();

		await page.goto(`/form/basics?fill=${valid}&enhance=${enhance}`);

		await setTimeout(500);

		await page.getByText("Submit").click();

		if (valid_data) {
			await expect(page.locator("body")).toHaveText(/Successfully/);
		} else {
			for (const [field, err] of Object.entries(form_errors)) {
				const message = await page.locator(`[name='${field}'] + .error`).textContent();

				expect(message).toBe(err.message);
			}
		}

		await context.close();
	});
}

testFormSubmission({ javascript: false, valid_data: false, enhance: false });
testFormSubmission({ javascript: false, valid_data: true, enhance: false });

testFormSubmission({ javascript: true, valid_data: false, enhance: false });
testFormSubmission({ javascript: true, valid_data: true, enhance: false });

testFormSubmission({ javascript: true, valid_data: false, enhance: true });
testFormSubmission({ javascript: true, valid_data: true, enhance: true });
