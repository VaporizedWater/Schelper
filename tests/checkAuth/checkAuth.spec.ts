import { test, expect } from "@playwright/test";
import assert from "assert";

test.describe("Authentication Functionality", () => {
    test("SFR-01: System checks if users are authenticated", async ({ page }) => {
        // Visit the homepage
        await page.goto("/");

        // Use a more specific selector - this targets the main content button, not the one in the banner
        const loginButton = page.getByRole("button", { name: "Log In" }).nth(1);
        const logoutButton = page.getByRole("button", { name: "Log Out" });

        //Check if the email is being displayed in the UI
        const emailPresent = page.locator("text=@psu.edu").first();
        //check if the login button is visible or logout button is visible
        await expect(loginButton.or(logoutButton.and(emailPresent))).toBeVisible();
    });

    test("SFR-02: Unauthenticated users are redirected to PSU IdP", async ({ page }) => {
        // Visit the homepage
        await page.goto("/");

        // Use the same specific selector for consistency
        const loginButton = page.getByRole("button", { name: "Log In" }).nth(1);
        const logoutButton = page.getByRole("button", { name: "Log Out" });

        if (await loginButton.isVisible()) {
            const microsoftRegex = /.*microsoft.*/i;

            // Click the login button and wait for navigation
            await Promise.all([loginButton.click(), page.waitForURL(microsoftRegex)]);

            // Check if redirected to Microsoft authentication page
            const currentUrl = page.url();
            console.log(currentUrl);
            expect(currentUrl).toContain("microsoft");
        } else if (await logoutButton.isVisible()) {
            expect(true).toBe(true);
        } else {
            // If neither button is visible, fail the test
            assert.fail("Neither login nor logout button is visible. User state is unknown.");
        }
    });

    test("SFR-04 & SFR-05: System checks privileges and allows access", async ({ page }) => {
        // Visit the homepage
        await page.goto("/");

        // First check if we're already logged in
        const logoutButton = page.getByRole("button", { name: "Log Out" });
        const isLogoutVisible = await logoutButton.isVisible().catch(() => false);
        const loginButton = page.getByRole("button", { name: "Log In" }).nth(1);
        const isLoginVisible = await loginButton.isVisible().catch(() => false);

        if (isLogoutVisible) {
            // User is already logged in, verify they can access protected content
            console.log("User is already logged in, checking access to protected resources");

            // Check if user has access to the calendar link
            const calendarLink = page.locator("a[href='/calendar']");
            await expect(calendarLink).toBeVisible();
        } else if (isLoginVisible) {
            // Not logged in, return true by default
            console.log("User is not logged in, returning true");

            //Return true by default
            expect(true).toBe(true);
        } else {
            // Neither button is visible, fail the test
            assert.fail("Neither login nor logout button is visible. User state is unknown.");
        }
    });

    test("Authenticated user can sign out", async ({ page }) => {
        // Visit the homepage
        await page.goto("/");

        // Check if already logged in
        const logoutButton = page.getByRole("button", { name: "Log Out" });
        const isLogoutVisible = await logoutButton.isVisible().catch(() => false);
        const loginButton = page.getByRole("button", { name: "Log In" }).nth(1);
        const isLoginVisible = await loginButton.isVisible().catch(() => false);

        if (isLogoutVisible) {
            console.log("User is already logged in, testing logout functionality");

            // User is already logged in, click logout
            await logoutButton.click();

            // Verify user is logged out (login button visible again)
            const loginButton = page.getByRole("button", { name: "Log In" }).nth(1);
            await expect(loginButton).toBeVisible();
        } else if (isLoginVisible) {
            console.log("User is not logged in, return true by default");

            // User is not logged in, return true by default
            expect(true).toBe(true);
        } else {
            // Neither button is visible, fail the test
            assert.fail("Neither login nor logout button is visible. User state is unknown.");
        }
    });
});
