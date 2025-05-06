// tests/tags.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Tag Functionality', () => {
  test('SFR-18: Edit class via tags panel', async ({ page }) => {
    // TODO: Locate and modify tags
  });

  test('SFR-27: Display and fill create tag form', async ({ page }) => {
    // TODO: Open tag form and fill
  });

  test('SFR-28: Saves tag to DB on form submit', async ({ page }) => {
    // TODO: Submit and check network
  });

  test('SFR-32: Add tag to class through property editor', async ({ page }) => {
    // TODO: Add tag from inside class property panel
  });
});
