import { test, expect } from "@playwright/test";

test("check whether the class is displayed", async ({ page }) => {
    await page.goto("/calendar");

    if ((await page.locator("#calendar-grid").count()) == 1) {
        // Check number of class items
        const isElementPresent = (await page.getByTitle("class-item").count()) > 0;

        // Assert truth of condition
        expect(isElementPresent).toBe(true);
    }
});
