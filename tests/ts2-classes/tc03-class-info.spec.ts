import { test, expect } from "@playwright/test";

test("check whether the class contains info", async ({ page }) => {
    await page.goto("/calendar");

    if ((await page.getByTitle("class-item").count()) > 0) {
        const classItem = await page.getByTitle("class-item");
        const hasInfo = (await classItem.locator("div").textContent())?.includes("Class:");

        expect(hasInfo).toBe(true);
    }
});
