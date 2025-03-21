import { test, expect, Page } from "@playwright/test";
import path from "path";

test.describe("Import Sheet Functionality", () => {
    // Helper function to wait for checkbox state
    interface WaitForCheckboxStateParams {
        selector: string;
        expectedState: boolean;
    }

    async function waitForCheckboxState(page: Page, selector: string, expectedState: boolean): Promise<void> {
        await page.waitForFunction(
            ({ selector, expectedState }: WaitForCheckboxStateParams) => {
                const checkbox = document.querySelector(selector) as HTMLInputElement | null;
                return checkbox && checkbox.checked === expectedState;
            },
            { selector, expectedState },
            { timeout: 5000 }
        );
    }

    test.beforeEach(async ({ page }) => {
        await page.goto("/importSheet");
    });

    test("page loads with correct initial state", async ({ page }) => {
        // Check for presence of important elements
        await expect(page.getByText("Import Sheet")).toBeVisible();
        await expect(page.getByRole("button", { name: "Import Selected Classes" })).not.toBeVisible();
        await expect(page.locator("table")).not.toBeVisible();
    });

    test("can upload valid Excel file and display classes", async ({ page }) => {
        const testFilePath = path.join(__dirname, "../../public/SP25QuerySample.xlsx");
        await page.setInputFiles('input[type="file"]', testFilePath);

        // Wait for table to be visible
        await page.locator("table").waitFor();

        // Check table headers directly
        const expectedHeaders = ["Class #", "Course", "Title", "Days", "Time", "Instructor", "Room", "Location"];
        for (const header of expectedHeaders) {
            const headerCell = page.locator(`th`, { hasText: header });
            await expect(headerCell).toBeVisible();
        }

        // Check import button
        const importButton = page.getByRole("button", { name: /Import Selected Classes/ });
        await expect(importButton).toBeVisible();
    });

    test("handles selection and deselection of classes", async ({ page }) => {
        const testFilePath = path.join(__dirname, "../../public/SP25QuerySample.xlsx");
        await page.setInputFiles('input[type="file"]', testFilePath);

        await page.locator("table").waitFor();

        // Get checkboxes
        const selectAllCheckbox = page.locator('thead input[type="checkbox"]').first();
        await selectAllCheckbox.waitFor();

        // All checkboxes are initially checked
        await expect(selectAllCheckbox).toBeChecked();

        // Unselect all
        await selectAllCheckbox.click();
        await expect(selectAllCheckbox).not.toBeChecked();

        await selectAllCheckbox.click();
        await expect(selectAllCheckbox).toBeChecked();

        // Verify row checkboxes
        const rowCheckboxes = page.locator('tbody input[type="checkbox"]');
        await expect(rowCheckboxes.first()).toBeChecked();

        // Deselect all
        await selectAllCheckbox.click();
        await expect(selectAllCheckbox).not.toBeChecked();
        await expect(rowCheckboxes.first()).not.toBeChecked();
    });

    test("correctly handles cancelled classes", async ({ page }) => {
        const testFilePath = path.join(__dirname, "../../public/SP25QuerySample.xlsx");
        await page.setInputFiles('input[type="file"]', testFilePath);

        // Get all class numbers in the table
        const classNumbers = await page.locator("tbody td:nth-child(2)").allTextContents();

        // Verify cancelled classes are not in the list
        // Assuming '5130' is a cancelled class number
        expect(classNumbers).not.toContain("5130");
    });

    test("correctly processes time format", async ({ page }) => {
        const testFilePath = path.join(__dirname, "../../public/SP25QuerySample.xlsx");
        await page.setInputFiles('input[type="file"]', testFilePath);

        // Check if times are correctly formatted (24-hour format)
        const timeCells = await page.locator("tbody td:nth-child(6)").allTextContents();
        for (const timeCell of timeCells) {
            // Verify format matches "HH:MM - HH:MM"
            expect(timeCell).toMatch(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9] - ([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/);
        }
    });

    test("imports selected classes successfully", async ({ page }) => {
        const testFilePath = path.join(__dirname, "../../public/SP25QuerySample.xlsx");
        await page.setInputFiles('input[type="file"]', testFilePath);

        await page.locator("table").waitFor();

        // Select first class
        const firstClassCheckbox = page.locator('tbody tr:first-child input[type="checkbox"]');
        await firstClassCheckbox.click();

        // Click import and check navigation
        await page.getByRole("button", { name: /Import Selected Classes/ }).click();

        // Just verify we're not on the import page anymore
        await page.waitForURL((url) => !url.pathname.endsWith("/importSheet"));
    });
});
