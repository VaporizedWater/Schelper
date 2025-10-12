// app/api/faculty/unavailability/class/route.ts
"use server";

import clientPromise from "@/lib/mongodb";
import { requireEmail } from "@/lib/requireEmail";
import type { DaySlots } from "@/lib/types";
import { Collection, Document } from "mongodb";

export async function PUT(request: Request): Promise<Response> {
    try {
        await requireEmail();

        const { email, classUnavailability } = (await request.json()) as {
            email?: string;
            classUnavailability?: DaySlots;
        };

        if (!email || !email.includes("@")) {
            return new Response(JSON.stringify({ error: "Valid 'email' required" }), { status: 400 });
        }
        if (!classUnavailability || typeof classUnavailability !== "object") {
            return new Response(JSON.stringify({ error: "Valid 'classUnavailability' object required" }), { status: 400 });
        }

        const client = await clientPromise;
        const facCol = client.db("class-scheduling-app").collection("faculty") as Collection<Document>;

        const res = await facCol.updateOne({ email }, { $set: { email, classUnavailability } }, { upsert: true });

        return new Response(JSON.stringify({ success: true, upserted: !!res.upsertedId }), { status: 200 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("PUT /api/faculty/unavailability/class error:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
