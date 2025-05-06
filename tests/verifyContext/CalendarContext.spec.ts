// tests/calendarContext.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';

const filePath = path.resolve(__dirname, '../../public/SP25QuerySample.xlsx');

interface Window {
    __calendarContext__?: {
        allClasses?: any[];
        conflicts?: any[];
        currentCalendar?: any;
        calendarInfoList?: any[];
    };
}

test.describe('CalendarContext Behavior', () => {
    test('SFR-11: allClasses is populated after calendar loads', async ({ page }) => {
        await page.goto('/');
        await page.goto('/calendar');

        await page.waitForFunction(() => {
            const ctx = (window as any).__calendarContext__;
            return Array.isArray(ctx?.allClasses) && ctx.allClasses.length > 0;
        }, null, { timeout: 10000, polling: 250 });

        const allClasses = await page.evaluate(() => (window as Window).__calendarContext__?.allClasses);
        expect(Array.isArray(allClasses)).toBe(true);
        expect(allClasses?.length).toBeGreaterThan(0);
    });

    test('SFR-22: detects conflicts after import', async ({ page }) => {
        await page.goto('/calendar');

        const conflicts = await page.evaluate(() => (window as Window).__calendarContext__?.conflicts);
        expect(Array.isArray(conflicts)).toBe(true);
    });

    test('SFR-26: cross-listed class groups share an _id', async ({ page }) => {
        await page.goto('/calendar');

        const allClasses = await page.evaluate(() => (window as Window).__calendarContext__?.allClasses);
        const seen = new Set();
        const duplicates = allClasses?.filter((cls: any) => {
            if (seen.has(cls._id)) return true;
            seen.add(cls._id);
            return false;
        });
        expect(duplicates?.length).toBeGreaterThan(0);
    });

    test('SFR-37: currentCalendar and calendars list are defined', async ({ page }) => {
        await page.goto('/calendar');
        const current = await page.evaluate(() => (window as Window).__calendarContext__?.currentCalendar);
        const list = await page.evaluate(() => (window as Window).__calendarContext__?.calendarInfoList);
        expect(current).toBeDefined();
        expect(Array.isArray(list)).toBe(true);
    });
});
