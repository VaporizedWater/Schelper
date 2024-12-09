import { test, expect } from "@playwright/test";

test("Check whether tags can be checked and unchecked", async ({ page }) => {
    await page.goto("/calendar");

    if ((await page.getByTitle("tag-item").count()) > 0) {
        const tagItem = await page.getByTitle("tag-item");

        expect(tagItem).not.toBeChecked();

        tagItem.check();

        expect(tagItem).toBeChecked();

        tagItem.uncheck();

        expect(tagItem).not.toBeChecked();
    }
});
