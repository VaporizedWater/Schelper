import { test, expect } from "@playwright/test";

test("open calendar view", async ({ page }) => {
    await page.goto("/calendar");

    const isElementPresent = (await page.locator("#calendar-grid").count()) > 0;
    expect(isElementPresent).toBe(true); // Adjust assertion as needed
});
