import { expect, test } from "@playwright/test";
import { setTimeout } from "timers/promises";
import { errorMessages } from "../src/lib/validation/messages";

async function testLocalization({
	javascript,
	locale,
	enhance
}: {
	javascript: boolean;
	locale: string;
	enhance: boolean;
}) {
	test(`validate form javascript=${javascript} with locale=${locale} data with enhance=${enhance}`, async ({
		browser
	}) => {
		const context = await browser.newContext({
			javaScriptEnabled: javascript,
			locale: "ar-SA"
		});
		const page = await context.newPage();

		await page.goto(`/form/basics?fill=invalid&enhance=${enhance}&test_use_locale=${locale}`);

		await setTimeout(500);

		await page.getByText("Submit").click();

		await setTimeout(100);

		const user_message = await page.locator(`[name='username'] + .error`).textContent();
		const password_message = await page.locator(`[name='password'] + .error`).textContent();

		// auto localize to browser language
		if (locale == "true") {
			expect(user_message).toBe(errorMessages.ar["username.invalid"]);
			expect(password_message).toBe("هذا الحقل إلزامي");
		}

		if (locale == "false") {
			expect(user_message).toBe("username.invalid");
		}

		if (locale == "en") {
			expect(user_message).toBe(errorMessages.en["username.invalid"]);
			expect(password_message).toBe("must have required property password");
		}

		if (locale == "es") {
			expect(user_message).toBe("username.invalid");
			expect(password_message).toBe("debe tener la propiedad requerida password");
		}

		await context.close();
	});
}

// test with specific locale
//TODO test store values ($errors,$errs,$validation_result.errors)
testLocalization({ javascript: true, enhance: true, locale: "en" });
testLocalization({ javascript: true, enhance: false, locale: "en" });
testLocalization({ javascript: false, enhance: false, locale: "en" });

// auto localization
testLocalization({ javascript: true, enhance: true, locale: "true" });
testLocalization({ javascript: true, enhance: false, locale: "true" });
testLocalization({ javascript: false, enhance: false, locale: "true" });

testLocalization({ javascript: true, enhance: true, locale: "es" });
testLocalization({ javascript: true, enhance: false, locale: "es" });
testLocalization({ javascript: false, enhance: false, locale: "es" });
