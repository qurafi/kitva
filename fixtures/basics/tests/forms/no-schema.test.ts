import { expect, test } from "@playwright/test";

test("form/no-schema", async ({ page }) => {
    await page.goto("form/no-schema");

    await page.click("button");

    await expect(page.locator("pre")).toHaveText(`{\n\n"success": true\n}`);
});

test("form/no-specific-schema", async ({ page }) => {
    await page.goto("form/no-specific-schema");

    await page.click("button");

    await expect(page.locator("pre")).toHaveText(`{\n\n"success": true\n}`);
});
