"use server";

import clientPromise from "@/lib/mongodb";
import { requireEmail } from "@/lib/requireEmail";
import type { DaySlots } from "@/lib/types";
import { Collection, Document } from "mongodb";
import { mergeDaySlots } from "@/lib/common";

const EMPTY: DaySlots = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitize(ds: any): DaySlots {
    const safe: DaySlots = {
        Mon: Array.isArray(ds?.Mon) ? ds.Mon : [],
        Tue: Array.isArray(ds?.Tue) ? ds.Tue : [],
        Wed: Array.isArray(ds?.Wed) ? ds.Wed : [],
        Thu: Array.isArray(ds?.Thu) ? ds.Thu : [],
        Fri: Array.isArray(ds?.Fri) ? ds.Fri : [],
    };
    // merge within category to normalize overlaps/duplicates
    return {
        Mon: mergeDaySlots([], safe.Mon),
        Tue: mergeDaySlots([], safe.Tue),
        Wed: mergeDaySlots([], safe.Wed),
        Thu: mergeDaySlots([], safe.Thu),
        Fri: mergeDaySlots([], safe.Fri),
    };
}

type Item = { email: string; addedUnavailability: DaySlots };

export async function PATCH(request: Request): Promise<Response> {
    try {
        await requireEmail();
        const body = await request.json();
        const items: Item[] = Array.isArray(body?.updates)
            ? body.updates
            : body?.email
            ? [{ email: String(body.email), addedUnavailability: sanitize(body.addedUnavailability) }]
            : [];

        if (items.length === 0) {
            return new Response(JSON.stringify({ error: "Provide {updates:[{email,addedUnavailability}]}" }), {
                status: 400,
            });
        }

        const client = await clientPromise;
        const facCol = client.db("class-scheduling-app").collection("faculty") as Collection<Document>;

        // merge *within added category* against current doc
        const ops = [];
        for (const it of items) {
            const email = String(it.email || "")
                .trim()
                .toLowerCase();
            if (!email || !email.includes("@")) continue;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cur = (await facCol.findOne({ email })) as any;
            const curAdded: DaySlots = cur?.addedUnavailability ?? EMPTY;
            const src = sanitize(it.addedUnavailability);
            const merged: DaySlots = {
                Mon: mergeDaySlots(curAdded.Mon, src.Mon),
                Tue: mergeDaySlots(curAdded.Tue, src.Tue),
                Wed: mergeDaySlots(curAdded.Wed, src.Wed),
                Thu: mergeDaySlots(curAdded.Thu, src.Thu),
                Fri: mergeDaySlots(curAdded.Fri, src.Fri),
            };
            ops.push({
                updateOne: {
                    filter: { email },
                    update: {
                        $set: { addedUnavailability: merged },
                        $setOnInsert: { classUnavailability: EMPTY, email },
                    },
                    upsert: true,
                },
            });
        }

        if (ops.length === 0) return new Response(JSON.stringify({ error: "No valid updates" }), { status: 400 });
        const res = await facCol.bulkWrite(ops, { ordered: false });
        return new Response(JSON.stringify({ success: true, modified: res.modifiedCount, upserts: res.upsertedCount }), {
            status: 200,
        });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("PATCH /api/faculty/unavailability/added error:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

/** REPLACE semantics (no merge) */
export async function PUT(request: Request): Promise<Response> {
  try {
    await requireEmail();
    const body = await request.json();
    const items: Item[] = Array.isArray(body?.updates)
      ? body.updates
      : body?.email
      ? [{ email: String(body.email), addedUnavailability: sanitize(body.addedUnavailability) }]
      : [];

    if (items.length === 0) {
      return new Response(JSON.stringify({ error: "Provide {updates:[{email,addedUnavailability}]}" }), { status: 400 });
    }

    const client = await clientPromise;
    const facCol = client.db("class-scheduling-app").collection("faculty") as Collection<Document>;

    const ops = [];
    for (const it of items) {
      const email = String(it.email || "").trim().toLowerCase();
      if (!email || !email.includes("@")) continue;

      const sanitized = sanitize(it.addedUnavailability); // normalize within-day only

      ops.push({
        updateOne: {
          filter: { email },
          update: { $set: { addedUnavailability: sanitized }, $setOnInsert: { classUnavailability: EMPTY, email } },
          upsert: true,
        },
      });
    }

    if (ops.length === 0) return new Response(JSON.stringify({ error: "No valid updates" }), { status: 400 });
    const res = await facCol.bulkWrite(ops, { ordered: false });
    return new Response(JSON.stringify({ success: true, modified: res.modifiedCount, upserts: res.upsertedCount }), { status: 200 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("PUT /api/faculty/unavailability/added error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}