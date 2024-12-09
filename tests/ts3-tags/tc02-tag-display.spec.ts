import { test, expect } from "@playwright/test";

test("Check whether tag data is displayed", async ({ page }) => {
    await page.goto("/calendar");

    await new Promise((r) => setTimeout(r, 2000));

    const isTagPresent = (await page.getByTitle("tag-item").count()) > 0;

    expect(isTagPresent).toBe(true);
});
