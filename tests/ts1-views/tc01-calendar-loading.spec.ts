import { test, expect } from "@playwright/test";

test("open calendar view", async ({ page }) => {
    await page.goto("/calendar");

    // Check number of calendar grid elements
    const isElementPresent = (await page.locator("#calendar-grid").count()) == 1;

    // Assert truth of condition
    expect(isElementPresent).toBe(true);
});
