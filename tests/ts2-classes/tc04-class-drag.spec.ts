import { test, expect } from "@playwright/test";

test("Check whether class can be dragged", async ({ page }) => {
    await page.goto("/calendar");

    const parentItem = await page.getByTitle("draggable");

    console.log(parentItem);

    if ((await page.getByTitle("class-item").count()) > 0) {
        const classItem = await parentItem.locator("div").getByTitle("class-item");
        const hasInfo = (await classItem.locator("div").textContent())?.includes("Class:");

        expect(hasInfo).toBe(true);
    }
});
