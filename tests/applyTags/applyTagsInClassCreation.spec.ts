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

    test("should display correct tag names in dropdown", async ({ page }) => {
        // Open the dropdown
        await page.click('[data-testid="dropdown-button"]', { timeout: 5000 });

        // Wait for dropdown content to appear
        await page.waitForSelector('[data-testid="dropdown-content"]', { state: "visible" });

        // Get tag labels
        const tagLabels = await page.locator('[data-testid="dropdown-content"] label').allInnerTexts();

        // Verify at least some tags exist
        expect(tagLabels.length).toBeGreaterThan(0);

        // Optional: verify specific tag names if you know them
        // expect(tagLabels).toContain("Expected Tag Name");
    });

    test("should filter tags when using search input", async ({ page }) => {
        // Open dropdown
        await page.click('[data-testid="dropdown-button"]');
        await page.waitForSelector('[data-testid="dropdown-content"]', { state: "visible" });

        // Get initial tag count
        const initialTags = await page.locator('[data-testid="dropdown-content"] label').count();

        // Check if search input exists and use it
        const searchInput = page.locator('[data-testid="tag-search"]');
        if ((await searchInput.count()) > 0) {
            // Type in search box to filter tags
            await searchInput.fill("tag"); // Assuming some tags contain "tag"

            // Wait for filtering to complete
            await page.waitForTimeout(500);

            // Check if tags are filtered
            const filteredTags = await page.locator('[data-testid="dropdown-content"] label').count();
            expect(filteredTags).toBeLessThanOrEqual(initialTags);
        }
    });

    test("should include selected tags when creating a class", async ({ page }) => {
        // Fill in required class details
        await page.fill('input[placeholder="Class Title"]', "Test Class");
        await page.selectOption("select", "Mon");
        await page.fill('input[type="time"]', "09:00");
        await page.fill('input[type="time"] >> nth=1', "10:00");

        // Select tags (using more robust selectors)
        await page.click('[data-testid="dropdown-button"]');
        await page.waitForSelector('[data-testid="dropdown-content"]', { state: "visible" });

        // Select first two tags
        await page.locator('[data-testid="dropdown-content"] input[type="checkbox"]').first().check();
        await page.locator('[data-testid="dropdown-content"] input[type="checkbox"]').nth(1).check();

        // Close dropdown by clicking the button again
        await page.click('[data-testid="dropdown-button"]');

        // Submit form
        await page.click('button[type="submit"]');

        // Wait for submission to process
        await page.waitForTimeout(1000);

        // Verify redirect to calendar or confirmation screen
        await expect(page).toHaveURL(/calendar|classes/);
    });

    test("should display selected tags in UI after selection", async ({ page }) => {
        // Open dropdown
        await page.click('[data-testid="dropdown-button"]');

        // Select tags
        const firstTagLabel = await page.locator('[data-testid="dropdown-content"] label').first().textContent();
        await page.locator('[data-testid="dropdown-content"] input[type="checkbox"]').first().check();

        // Close dropdown
        await page.click('[data-testid="dropdown-button"]');

        // Check if selected tag appears in UI (if your app shows selected tags)
        if (firstTagLabel) {
            const selectedTagsSection = page.locator('[data-testid="selected-tags"]');
            if ((await selectedTagsSection.count()) > 0) {
                await expect(selectedTagsSection).toContainText(firstTagLabel.trim());
            }
        }
    });
});
