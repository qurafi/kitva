import { expect, test } from "@playwright/test";
import { setTimeout } from "timers/promises";

const form_error = {
	__form_default: {
		input: {
			email: "test@"
		},
		errors: {
			username: {
				instancePath: "",
				schemaPath: "#/required",
				keyword: "required",
				params: {
					missingProperty: "username"
				},
				message: "must have required property 'username'"
			},
			first_name: {
				instancePath: "",
				schemaPath: "#/required",
				keyword: "required",
				params: {
					missingProperty: "first_name"
				},
				message: "must have required property 'first_name'"
			},
			email: {
				instancePath: "/email",
				schemaPath: "#/properties/email/errorMessage",
				keyword: "errorMessage",
				params: {
					errors: [
						{
							instancePath: "/email",
							schemaPath: "#/properties/email/format",
							keyword: "format",
							params: {
								format: "email"
							},
							message: 'must match format "email"',
							emUsed: true
						}
					]
				},
				message: "email is not valid"
			}
		}
	}
};

const form_error_json = JSON.stringify(form_error, null, 2);

const min_length_msg = "must NOT have fewer than 1 characters";

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
			if (!javascript) {
				// when javascript enabled, the form submission will be prevented
			}
			// await expect(page.locator("pre")).toHaveText(form_error_json);
			for (const [field, err] of Object.entries(form_error.__form_default.errors)) {
				let message = await page.locator(`[name='${field}'] + .error`).textContent();

				// on the client we don't update the coerced values on input

				await expect(message).toBe(err.message);
			}
		}

		await context.close();
	});
}

testFormSubmission({ javascript: false, valid_data: false, enhance: false });
testFormSubmission({ javascript: false, valid_data: true, enhance: false });

testFormSubmission({ javascript: true, valid_data: false, enhance: false });
testFormSubmission({ javascript: true, valid_data: true, enhance: false });

testFormSubmission({ javascript: false, valid_data: false, enhance: true });
testFormSubmission({ javascript: false, valid_data: true, enhance: true });

testFormSubmission({ javascript: true, valid_data: false, enhance: true });
testFormSubmission({ javascript: true, valid_data: true, enhance: true });
