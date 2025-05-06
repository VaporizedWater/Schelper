// import { test, expect } from "@playwright/test";
// import path from "path";

// test.describe("Apply Tags to Class Properties", () => {
//     test.beforeEach(async ({ page }) => {
//         // Start at calendar view where classes are already loaded
//         await page.goto("/calendar");
//         await page.waitForSelector(".fc-event");
//     });

//     test("can select and apply tags to existing class", async ({ page }) => {
//         // Click on the class event in calendar
//         await page.locator(".fc-event").first().click();

//         // Wait for class properties panel to update
//         await page.waitForSelector('input[type="checkbox"]');

//         // Find and click a tag checkbox
//         const firstTagCheckbox = page.locator('.scrollbar-thin input[type="checkbox"]').first();
//         await firstTagCheckbox.check();

//         // Verify checkbox is checked
//         await expect(firstTagCheckbox).toBeChecked();
//     });

//     test("can remove tags from existing class", async ({ page }) => {
//         // Click on class and add tag
//         await page.locator(".fc-event").first().click();
//         await page.waitForSelector('input[type="checkbox"]');

//         const firstTagCheckbox = page.locator('.scrollbar-thin input[type="checkbox"]').first();
//         await firstTagCheckbox.check();
//         await expect(firstTagCheckbox).toBeChecked();

//         // Remove tag
//         await firstTagCheckbox.uncheck();
//         await expect(firstTagCheckbox).not.toBeChecked();
//     });

//     test("persists tags after page refresh", async ({ page }) => {
//         // Add tag to class
//         await page.locator(".fc-event").first().click();
//         await page.waitForSelector('input[type="checkbox"]');

//         // Wait for tags to load initially
//         await page.waitForFunction(() => {
//             const checkboxes = document.querySelectorAll('.scrollbar-thin input[type="checkbox"]');
//             return checkboxes.length > 0;
//         });

//         const firstTagCheckbox = page.locator('.scrollbar-thin input[type="checkbox"]').first();
//         await firstTagCheckbox.check();

//         // Refresh page
//         await page.reload();
//         await page.waitForSelector(".fc-event");

//         // Click the same class again
//         await page.locator(".fc-event").first().click();

//         // Wait for tags to load after refresh
//         await page.waitForFunction(() => {
//             const checkboxes = document.querySelectorAll('.scrollbar-thin input[type="checkbox"]');
//             return checkboxes.length > 0;
//         });

//         // Verify tag is still checked
//         const sameTagCheckbox = page.locator('.scrollbar-thin input[type="checkbox"]').first();
//         await expect(sameTagCheckbox).toBeChecked();
//     });

//     test("can select multiple tags for one class", async ({ page }) => {
//         await page.locator(".fc-event").first().click();
//         await page.waitForSelector('input[type="checkbox"]');

//         // Select multiple tags
//         const checkboxes = page.locator('.scrollbar-thin input[type="checkbox"]');
//         await checkboxes.nth(0).check();
//         await checkboxes.nth(1).check();

//         // Verify both are checked
//         await expect(checkboxes.nth(0)).toBeChecked();
//         await expect(checkboxes.nth(1)).toBeChecked();
//     });
// });
