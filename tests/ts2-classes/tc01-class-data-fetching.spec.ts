import { test, expect } from "@playwright/test";

test("check whether class data is fetched correctly from db", async ({ request }) => {
    const res = await request.get("/api/classes", {
        headers: {
            id: "67414a410fd45343c92b76e8",
        },
    });

    expect(res.ok()).toBeTruthy();

    expect(res).toBeDefined;

    const data = await res.json();

    expect(data).toBeDefined();
    expect(data.object_id).toBeDefined();
    expect(data.associated_properties).toBeDefined();
    expect(data.catalog_num).toBeDefined();
    expect(data.class_num).toBeDefined();
    expect(data.session).toBeDefined();
    expect(data.course_subject).toBeDefined();
    expect(data.course_num).toBeDefined();
    expect(data.section).toBeDefined();
    expect(data.title).toBeDefined();
    expect(data.location).toBeDefined();
    expect(data.enrollment_cap).toBeDefined();
    expect(data.waitlist_cap).toBeDefined();
});
