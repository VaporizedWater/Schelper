import { test, expect } from "@playwright/test";

test("check whether all tag data is fetched correctly from db", async ({ request }) => {
    const res = await request.get("/api/tags");

    expect(res.ok()).toBeTruthy();

    expect(res).toBeDefined;

    const data = await res.json();

    expect(data).toBeDefined();

    // console.log(data);

    for (let item of data) {
        expect(item).toBeDefined();
        expect(item._id).toBeDefined();
        expect(item.tagName).toBeDefined();
        expect(item.classes).toBeDefined();
    }
});
