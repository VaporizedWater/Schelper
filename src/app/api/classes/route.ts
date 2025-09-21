"use server";

import clientPromise from "@/lib/mongodb";
import { requireEmail } from "@/lib/requireEmail";
import { ObjectId } from "mongodb";
import type { ClassInfo } from "@/lib/types";

export async function GET(request: Request): Promise<Response> {
    try {
        const userEmail = await requireEmail();

        const departmentIdHeader = request.headers.get("departmentId");
        if (!departmentIdHeader || !ObjectId.isValid(departmentIdHeader)) {
            return new Response(JSON.stringify({ error: "Header: 'departmentId' is missing or invalid" }), { status: 400 });
        }
        const departmentId = new ObjectId(departmentIdHeader);

        const client = await clientPromise;
        const users = client.db("class-scheduling-app").collection("users");

        // Fetch only the matched department
        const doc = await users.findOne(
            { email: userEmail, "departments._id": departmentId },
            { projection: { "departments.$": 1, _id: 0 } }
        );

        const dept = doc?.departments?.[0]; // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list: ClassInfo[] = (dept?.class_list ?? []).map((c: any) => ({
            _id: c._id?.toString(),
            course_subject: c.course_subject ?? "",
            course_num: c.course_num ?? "",
            catalog_num: c.catalog_num ?? "",
            title: c.title ?? "",
        }));

        return new Response(JSON.stringify(list), { status: 200 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("GET /api/classes error:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

export async function POST(request: Request): Promise<Response> {
    try {
        const userEmail = await requireEmail();

        const departmentIdHeader = request.headers.get("departmentId");

        if (!departmentIdHeader || !ObjectId.isValid(departmentIdHeader)) {
            return new Response(JSON.stringify({ error: "Header: 'departmentId' is missing or invalid" }), { status: 400 });
        }

        const departmentId = new ObjectId(departmentIdHeader);

        const { courses } = await request.json();

        if (!Array.isArray(courses) || courses.length === 0) {
            return new Response(JSON.stringify({ error: "Body must include non-empty 'courses' array" }), { status: 400 });
        }

        // Normalize + attach _id for stable deletes later
        const normalized: ClassInfo[] = courses
            .map((c: ClassInfo) => ({
                _id: new ObjectId().toString(),
                course_subject: String(c.course_subject ?? "").trim(),
                course_num: String(c.course_num ?? "").trim(),
                catalog_num: String(c.catalog_num ?? "").trim(),
                title: String(c.title ?? "").trim(),
            }))
            .filter((c) => c.title || c.catalog_num);

        const client = await clientPromise;
        const usersCollection = client.db("class-scheduling-app").collection("users");

        // Check if user owns that department or not
        // 1) Verify user & presence of the target department (for clean 404s)
        const user = (await usersCollection.findOne({ email: userEmail })) as
            | (Document & { departments?: any[]; current_department_id?: any }) // eslint-disable-line @typescript-eslint/no-explicit-any
            | null;

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const departments = Array.isArray(user?.departments) ? user.departments : [];
        const departmentExists = departments.some((d) => String(d?._id) === departmentIdHeader);
        if (!departmentExists) {
            return new Response(JSON.stringify({ error: "Department not found" }), { status: 404 });
        }

        // Replace the department's class_list atomically
        const result = await usersCollection.updateOne(
            { email: userEmail, "departments._id": departmentId },
            { $set: { "departments.$.class_list": normalized } }
        );

        if (result.matchedCount === 0) {
            return new Response(JSON.stringify({ error: "User or department not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true, replaced: normalized.length }), { status: 201 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("POST /api/classes error:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

export async function DELETE(request: Request): Promise<Response> {
    try {
        const userEmail = await requireEmail();

        const departmentIdHeader = request.headers.get("departmentId");

        if (!departmentIdHeader || !ObjectId.isValid(departmentIdHeader)) {
            return new Response(JSON.stringify({ error: "Header: 'departmentId' is missing or invalid" }), { status: 400 });
        }

        const departmentId = new ObjectId(departmentIdHeader);

        const { id } = await request.json();
        if (!id || !ObjectId.isValid(id)) {
            return new Response(JSON.stringify({ error: "Invalid 'id' in body" }), { status: 400 });
        }

        const client = await clientPromise;
        const usersCollection = client.db("class-scheduling-app").collection("users");

        // Check if user owns that department or not
        // 1) Verify user & presence of the target department (for clean 404s)
        const user = (await usersCollection.findOne({ email: userEmail })) as
            | (Document & { departments?: any[]; current_department_id?: any }) // eslint-disable-line @typescript-eslint/no-explicit-any
            | null;

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const departments = Array.isArray(user?.departments) ? user.departments : [];
        const departmentExists = departments.some((d) => String(d?._id) === departmentIdHeader);
        if (!departmentExists) {
            return new Response(JSON.stringify({ error: "Department not found" }), { status: 404 });
        }

        const result = await usersCollection.updateOne({ email: userEmail, "departments._id": departmentId }, {
            $pull: { "departments.$.class_list": { _id: id } },
        } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

        if (result.modifiedCount === 0) {
            return new Response(JSON.stringify({ error: "Course not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("DELETE /api/classes error:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
