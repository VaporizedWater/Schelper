import { test, expect } from "@playwright/test";

test("check if days of week are present", async ({ page }) => {
    await page.goto("/calendar");

    // const isDaysOfWeekPresent = (await page.getByTitle("days-of-week").count()) > 0;
    expect((await page.getByTitle("days-of-week").count()) > 0).toBe(true);

    // Check if all days are present
    expect((await page.getByTitle("MON").count()) > 0).toBe(true);
    expect((await page.getByTitle("TUE").count()) > 0).toBe(true);
    expect((await page.getByTitle("WED").count()) > 0).toBe(true);
    expect((await page.getByTitle("THU").count()) > 0).toBe(true);
    expect((await page.getByTitle("FRI").count()) > 0).toBe(true);
});
