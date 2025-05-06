// tests/classForm.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Class Form Functionality', () => {
  test('SFR-15: Add class form accepts details', async ({ page }) => {
    // TODO: Click add button and fill form
  });

  test('SFR-16: Validates form input', async ({ page }) => {
    // TODO: Submit bad data and verify errors
  });

  test('SFR-17: Saves class to DB', async ({ page }) => {
    // TODO: Submit good data and check save
  });

  test('SFR-31: Select tag from dropdown during class creation', async ({ page }) => {
    // TODO: Confirm tag selection is possible
  });
});
