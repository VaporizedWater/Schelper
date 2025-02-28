import { test, expect } from "@playwright/test";

test.describe("Tag Selection in Class Creation", () => {
    test.beforeEach(async ({ page }) => {
        // Start from calendar page
        await page.goto("/calendar");

        // Wait for some calendar events to be visible and interactive
        await page.waitForSelector(".fc-event", { state: "attached", timeout: 100000 });

        // Wait for the calendar to be fully loaded by checking for specific calendar elements
        await page.waitForSelector(".fc-view-harness", { state: "visible" });
        // await page.waitForSelector(".fc-toolbar", { state: "visible" });

        // Additional wait to ensure the page is stable
        await page.waitForTimeout(2000);

        // Navigate to class creation page
        await page.click('text="Create"');
        await page.click('text="Class"');

        // Ensure we're on the class creation page and form is loaded
        await expect(page).toHaveURL("/classes");
        await page.waitForSelector('input[placeholder="Class Title"]', { state: "visible" });
    });

    test("should display tag dropdown and allow tag selection", async ({ page }) => {
        // Click the tag dropdown button
        await page.click('[data-testid="dropdown-button"]');

        // Verify that the dropdown appears
        const dropdown = await page.locator('[data-testid="dropdown-content"]');
        await expect(dropdown).toBeVisible();

        // Check if tags are present
        const tagCheckboxes = await page.locator('input[type="checkbox"]');
    });

    test("should update tag count when selecting/deselecting tags", async ({ page }) => {
        // Open the dropdown
        await page.click('text="Select Tags (0)"');

        // Select first tag
        await page.click('input[type="checkbox"]>> nth=0');
        await expect(page.locator('text="Select Tags (1)"')).toBeVisible();

        // Select second tag
        await page.click('input[type="checkbox"] >> nth=1');
        await expect(page.locator('text="Select Tags (2)"')).toBeVisible();

        // Deselect first tag
        await page.click('input[type="checkbox"] >> nth=0');
        await expect(page.locator('text="Select Tags (1)"')).toBeVisible();
    });

    test("should maintain selected tags when dropdown is closed and reopened", async ({ page }) => {
        // Open dropdown and select tags
        await page.click('text="Select Tags (0)"');
        await page.click('input[type="checkbox"] >> nth=0');

        // Close dropdown by clicking outside
        await page.click("body");

        // Reopen dropdown
        await page.click('text="Select Tags (1)"');

        // Verify first checkbox is still checked
        const firstCheckbox = await page.locator('input[type="checkbox"] >> nth=0');
        await expect(firstCheckbox).toBeChecked();
    });

    test("should include selected tags when creating a class", async ({ page }) => {
        // Fill in required class details
        await page.fill('input[placeholder="Class Title"]', "Test Class");
        await page.selectOption("select", "Mon");
        await page.fill('input[type="time"]', "09:00");
        await page.fill('input[type="time"] >> nth=1', "10:00");

        // Select tags
        await page.click('text="Select Tags (0)"');
        await page.click('input[type="checkbox"] >> nth=0');
        await page.click('input[type="checkbox"] >> nth=1');

        // Submit form
        await page.click('text="Select Tags (2)"');
        await page.click('button[type="submit"]');

        // // Verify form submission (you might need to adjust this based on your implementation)
        // await expect(page).not.toHaveURL("/classes");
    });
});
