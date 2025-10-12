// app/api/faculty/route.ts
"use server";

import clientPromise from "@/lib/mongodb";
import { requireEmail } from "@/lib/requireEmail";
import { ObjectId, Collection, Document } from "mongodb";
import type { DaySlots, FacultyType } from "@/lib/types";

const DEFAULT_DAY_SLOTS: DaySlots = {
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
};

function normalizeFacultyList(input: unknown): { email: string; name?: string }[] {
    if (!Array.isArray(input)) return [];
    const seen = new Set<string>();
    const out: { email: string; name?: string }[] = [];

    for (const it of input) {
        if (!it || typeof it !== "object") continue;
        const email = String((it as any).email ?? "").trim(); // eslint-disable-line @typescript-eslint/no-explicit-any
        const name = String((it as any).name ?? "").trim(); // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!email || !email.includes("@")) continue;

        const key = email.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ email, name: name || undefined });
    }
    return out;
}

async function ensureEmailIndex() {
    const client = await clientPromise;
    const facCol = client.db("class-scheduling-app").collection("faculty") as Collection<Document>;
    // Idempotent in MongoDB; inexpensive if already present
    await facCol.createIndex({ email: 1 }, { unique: true });
}

async function fetchEnriched(userEmail: string, departmentIdHeader: string): Promise<FacultyType[]> {
    const client = await clientPromise;
    const db = client.db("class-scheduling-app");
    const users = db.collection("users") as Collection<Document>;
    const facCol = db.collection("faculty") as Collection<Document>;

    const departmentId = new ObjectId(departmentIdHeader);

    // Verify user + department
    const user = await users.findOne(
        { email: userEmail, "departments._id": departmentId },
        { projection: { "departments.$": 1, _id: 0 } }
    );

    if (!user?.departments?.[0]) return [];

    const dept = user.departments[0] as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    const list = Array.isArray(dept.faculty_list) ? dept.faculty_list : [];
    if (list.length === 0) return [];

    const emails = list.map((f: any) => String(f.email || "").trim()).filter(Boolean); // eslint-disable-line
    const namesByEmail = new Map<string, string | undefined>(
        list.map((f: any) => [String(f.email).toLowerCase(), f.name || undefined]) // eslint-disable-line
    );

    // Query directory
    const cursor = facCol.find(
        { email: { $in: emails } },
        { projection: { email: 1, name: 1, classUnavailability: 1, addedUnavailability: 1 } }
    );

    const dirDocs = await cursor.toArray();
    const dirByEmail = new Map(dirDocs.map((d) => [String(d.email).toLowerCase(), d]));

    // Build DTO preserving department order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dto: FacultyType[] = emails.map((raw: any) => {
        const key = raw.toLowerCase();
        const dir = dirByEmail.get(key);
        return {
            email: raw,
            name: namesByEmail.get(key),
            _id: dir?._id?.toString(),
            classUnavailability: (dir?.classUnavailability as DaySlots) ?? DEFAULT_DAY_SLOTS,
            addedUnavailability: (dir?.addedUnavailability as DaySlots) ?? DEFAULT_DAY_SLOTS,
        };
    });

    return dto;
}

/**
 * GET -> returns enriched FacultyType[] for the given department
 * Header required: departmentId
 */
export async function GET(request: Request): Promise<Response> {
    try {
        const userEmail = await requireEmail();

        const departmentIdHeader = request.headers.get("departmentId");
        if (!departmentIdHeader || !ObjectId.isValid(departmentIdHeader)) {
            return new Response(JSON.stringify({ error: "Header: 'departmentId' is missing or invalid" }), { status: 400 });
        }

        const enriched = await fetchEnriched(userEmail, departmentIdHeader);
        return new Response(JSON.stringify(enriched), { status: 200 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("GET /api/faculty error:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

/**
 * POST -> replace the department's faculty_list with provided FacultyInfo[]
 * Header required: departmentId
 * Body: { faculty: {email, name?}[] }
 * - Replaces membership
 * - Ensures directory docs exist (upsert-by-email with default unavailability)
 * - Returns enriched DTO[]
 */
export async function POST(request: Request): Promise<Response> {
    try {
        const userEmail = await requireEmail();

        const departmentIdHeader = request.headers.get("departmentId");
        if (!departmentIdHeader || !ObjectId.isValid(departmentIdHeader)) {
            return new Response(JSON.stringify({ error: "Header: 'departmentId' is missing or invalid" }), { status: 400 });
        }
        const departmentId = new ObjectId(departmentIdHeader);

        const body = await request.json();
        const clean = normalizeFacultyList(body?.faculty);

        const client = await clientPromise;
        const db = client.db("class-scheduling-app");
        const users = db.collection("users") as Collection<Document>;
        const facCol = db.collection("faculty") as Collection<Document>;

        await ensureEmailIndex();

        // 1) Replace membership list
        const update = await users.updateOne(
            { email: userEmail, "departments._id": departmentId },
            { $set: { "departments.$.faculty_list": clean } }
        );
        if (update.matchedCount === 0) {
            return new Response(JSON.stringify({ error: "User or department not found" }), { status: 404 });
        }

        // 2) Ensure directory presence using upsert-by-email
        if (clean.length > 0) {
            const ops = clean.map(({ email }) => ({
                updateOne: {
                    filter: { email },
                    update: {
                        $setOnInsert: {
                            email,
                            classUnavailability: DEFAULT_DAY_SLOTS,
                            addedUnavailability: DEFAULT_DAY_SLOTS,
                        },
                    },
                    upsert: true,
                },
            }));
            // unordered to avoid E11000 aborting the whole batch if two clients race
            await facCol.bulkWrite(ops, { ordered: false });
        }

        // 3) Return enriched rows
        const enriched = await fetchEnriched(userEmail, departmentIdHeader);
        return new Response(JSON.stringify(enriched), { status: 200 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("POST /api/faculty error:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

/**
 * DELETE -> remove a single faculty by email from department membership
 * Header required: departmentId
 * Body: { email: string }
 * (Does NOT delete the global directory doc)
 */
export async function DELETE(request: Request): Promise<Response> {
    try {
        const userEmail = await requireEmail();

        const departmentIdHeader = request.headers.get("departmentId");
        if (!departmentIdHeader || !ObjectId.isValid(departmentIdHeader)) {
            return new Response(JSON.stringify({ error: "Header: 'departmentId' is missing or invalid" }), { status: 400 });
        }
        const departmentId = new ObjectId(departmentIdHeader);

        const { email } = await request.json();
        const trimmed = typeof email === "string" ? email.trim() : "";
        if (!trimmed || !trimmed.includes("@")) {
            return new Response(JSON.stringify({ error: "Invalid 'email' in body" }), { status: 400 });
        }

        const client = await clientPromise;
        const users = client.db("class-scheduling-app").collection("users") as Collection<Document>;

        const result = await users.updateOne({ email: userEmail, "departments._id": departmentId }, {
            $pull: { "departments.$.faculty_list": { email: trimmed } },
        } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

        if (result.modifiedCount === 0) {
            return new Response(JSON.stringify({ error: "Email not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("DELETE /api/faculty error:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
