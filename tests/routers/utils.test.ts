import test, { expect } from "@playwright/test";


test.describe('loadCombinedClasses API', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000'); // Adjust the URL to your application's URL
    });

    test('should return combined classes when API call is successful', async ({ page }) => {
        const mockClasses = [
            { _id: "111111111111111111111111", classData: {"a":"a"}, classProperties: {"b":"b"}, events: undefined },
            { _id: "222222222222222222222222", classData: {"c":"c"}, classProperties: {"d":"d"}, events: undefined },
        ];

        // await page.route('**/api/combined_classes', route =>
        //     route.fulfill({
        //         status: 200,
        //         body: JSON.stringify(mockClasses),
        //     })
        // );

        const result = await page.evaluate(async () => {
            const response = await fetch('http://localhost:3000/api/combined_classes', {
                headers: { ids: "111111111111111111111111,222222222222222222222222" },
            });
            return response.json();
        });
        console.log(result);
        expect(result).toEqual(mockClasses);
    });
});