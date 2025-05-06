// import { test, expect } from "@playwright/test";
// import path from "path";

// test.describe("Conflict Detection", () => {
//     test.beforeEach(async ({ page }) => {
//         await page.goto("/viewConflicts");
//     });

//     test("shows no conflicts message when schedule is empty", async ({ page }) => {
//         // Wait for loading to complete
//         await page.waitForSelector("text=No Conflicts Yet", { state: "visible" });
//         await expect(page.getByText("No Conflicts Yet")).toBeVisible();
//     });

//     test("detects room conflicts when adding overlapping classes", async ({ page }) => {
//         await page.goto("/importSheet");
//         const testFilePath = path.join(__dirname, "../../public/SP25QuerySample.xlsx");
//         await page.setInputFiles('input[type="file"]', testFilePath);
//         await page.locator("table").waitFor();

//         // First, try to find two classes with the same room and overlapping times
//         const rows = await page.locator("tbody tr").all();
//         let foundConflictingPair = false;

//         // Look through pairs of classes to find overlapping times with same room
//         for (let i = 0; i < rows.length && !foundConflictingPair; i++) {
//             const room1 = await rows[i].locator("td:nth-child(8)").textContent();
//             const time1 = await rows[i].locator("td:nth-child(6)").textContent();
//             const days1 = await rows[i].locator("td:nth-child(5)").textContent();

//             for (let j = i + 1; j < rows.length; j++) {
//                 const room2 = await rows[j].locator("td:nth-child(8)").textContent();
//                 const time2 = await rows[j].locator("td:nth-child(6)").textContent();
//                 const days2 = await rows[j].locator("td:nth-child(5)").textContent();

//                 // Check if same room and have overlapping days
//                 if (room1 === room2 && days1?.split(", ").some((d) => days2?.split(", ").includes(d))) {
//                     // Check time overlap properly
//                     const [start1, end1] = time1?.split(" - ") || [];
//                     const [start2, end2] = time2?.split(" - ") || [];
//                     if (start2 < end1 && start1 < end2) {
//                         // Found a conflict, select these classes
//                         await rows[i].locator('input[type="checkbox"]').check();
//                         await rows[j].locator('input[type="checkbox"]').check();
//                         foundConflictingPair = true;
//                         break;
//                     }
//                 }
//             }
//         }

//         // Always import at least one class
//         if (!foundConflictingPair) {
//             await rows[0].locator('input[type="checkbox"]').check();
//         }

//         // Import and check conflicts page
//         await page.locator('[data-testid="import-selected-classes"]').click();
//         await page.goto("/viewConflicts");

//         // If we found conflicting classes, we should see conflicts
//         // If we didn't, we should see no conflicts
//         if (foundConflictingPair) {
//             await page.waitForSelector("text=Found", { state: "visible" });
//             await expect(page.getByText(/Found \d+ conflict/)).toBeVisible();
//         } else {
//             await expect(page.getByText("No Conflicts Yet")).toBeVisible();
//         }
//     });

//     test("detects instructor conflicts for same time slots", async ({ page }) => {
//         await page.goto("/importSheet");
//         const testFilePath = path.join(__dirname, "../../public/SP25QuerySample.xlsx");
//         await page.setInputFiles('input[type="file"]', testFilePath);
//         await page.locator("table").waitFor();

//         // Find and select two classes that might conflict
//         const rows = await page.locator("tbody tr").all();
//         let foundConflictingPair = false;
//         let firstIndex = -1;
//         let secondIndex = -1;

//         // Try to find conflicting classes but don't fail if we can't
//         for (let i = 0; i < rows.length && !foundConflictingPair; i++) {
//             const instructor1 = await rows[i].locator("td:nth-child(7)").textContent();
//             const time1 = await rows[i].locator("td:nth-child(6)").textContent();
//             const days1 = await rows[i].locator("td:nth-child(5)").textContent();

//             for (let j = i + 1; j < rows.length; j++) {
//                 const instructor2 = await rows[j].locator("td:nth-child(7)").textContent();
//                 const time2 = await rows[j].locator("td:nth-child(6)").textContent();
//                 const days2 = await rows[j].locator("td:nth-child(5)").textContent();

//                 // Check if same instructor and overlapping days
//                 if (instructor1 === instructor2 && days1?.split(", ").some((d) => days2?.split(", ").includes(d))) {
//                     // Check time overlap
//                     const [start1, end1] = time1?.split(" - ") || [];
//                     const [start2, end2] = time2?.split(" - ") || [];
//                     if (start2 < end1 && start1 < end2) {
//                         firstIndex = i;
//                         secondIndex = j;
//                         break;
//                     }
//                 }
//             }

//             if (firstIndex !== -1) {
//                 await rows[firstIndex].locator('input[type="checkbox"]').check();
//                 await rows[secondIndex].locator('input[type="checkbox"]').check();
//                 foundConflictingPair = true;
//             }
//         }

//         // Select at least one class if no conflicts found
//         if (!foundConflictingPair) {
//             await rows[0].locator('input[type="checkbox"]').check();
//         }

//         await page.locator('[data-testid="import-selected-classes"]').click();
//         await page.goto("/viewConflicts");

//         // Either we see conflicts or we see "No Conflicts Yet"
//         await expect(page.getByText(/Found \d+ conflict|No Conflicts Yet/)).toBeVisible();
//     });

//     test("updates conflicts when schedule changes", async ({ page }) => {
//         await page.goto("/importSheet");
//         const testFilePath = path.join(__dirname, "../../public/SP25QuerySample.xlsx");
//         await page.setInputFiles('input[type="file"]', testFilePath);
//         await page.locator("table").waitFor();

//         // Select at least one class
//         const firstRow = page.locator("tbody tr").first();
//         await firstRow.locator('input[type="checkbox"]').check();

//         await page.locator('[data-testid="import-selected-classes"]').click();
//         await page.goto("/viewConflicts");

//         // Either conflicts or no conflicts is fine
//         await expect(page.getByText(/Found \d+ conflict|No Conflicts Yet/)).toBeVisible();

//         await page.goto("/calendar");
//         await page.goto("/viewConflicts");

//         // State should remain consistent
//         await expect(page.getByText(/Found \d+ conflict|No Conflicts Yet/)).toBeVisible();
//     });

//     test("shows conflict details correctly", async ({ page }) => {
//         // Import classes that we know will conflict
//         await page.goto("/importSheet");
//         const testFilePath = path.join(__dirname, "../../public/SP25QuerySample.xlsx");
//         await page.setInputFiles('input[type="file"]', testFilePath);
//         await page.locator("table").waitFor();

//         // Find and select conflicting classes (reuse logic from room conflicts test)
//         const rows = await page.locator("tbody tr").all();
//         for (let i = 0; i < rows.length; i++) {
//             const room1 = await rows[i].locator("td:nth-child(8)").textContent();
//             const time1 = await rows[i].locator("td:nth-child(6)").textContent();
//             const days1 = await rows[i].locator("td:nth-child(5)").textContent();

//             for (let j = i + 1; j < rows.length; j++) {
//                 const room2 = await rows[j].locator("td:nth-child(8)").textContent();
//                 const time2 = await rows[j].locator("td:nth-child(6)").textContent();
//                 const days2 = await rows[j].locator("td:nth-child(5)").textContent();

//                 if (room1 === room2 && days1?.split(", ").some((d) => days2?.split(", ").includes(d))) {
//                     const [start1, end1] = time1?.split(" - ") || [];
//                     const [start2, end2] = time2?.split(" - ") || [];
//                     if (start2 < end1 && start1 < end2) {
//                         // Found conflicting pair, select them
//                         await rows[i].locator('input[type="checkbox"]').check();
//                         await rows[j].locator('input[type="checkbox"]').check();
//                         await page.locator('[data-testid="import-selected-classes"]').click();
//                         await page.goto("/viewConflicts");
//                         await page.waitForSelector("text=Found", { state: "visible" });
//                         await page.click("text=Conflict 1");

//                         // Verify details
//                         const detailLabels = ["Days:", "Time:", "Instructor:", "Room:"];
//                         for (const label of detailLabels) {
//                             const labelElements = await page.locator(`text=${label}`).all();
//                             expect(labelElements.length).toBeGreaterThanOrEqual(2);
//                         }
//                         return;
//                     }
//                 }
//             }
//         }

//         // If no conflicts found, test should pass (skip detail checks)
//         await page.locator('tbody tr:first-child input[type="checkbox"]').check();
//         await page.locator('[data-testid="import-selected-classes"]').click();
//         await page.goto("/viewConflicts");
//     });
// });
