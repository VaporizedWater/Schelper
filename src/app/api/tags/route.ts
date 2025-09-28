import clientPromise from "@/lib/mongodb";
import { requireEmail } from "@/lib/requireEmail";
import { handleBulkWriteResult } from "@/lib/routerUtils";
import { AnyBulkWriteOperation, UpdateFilter } from "mongodb";

type TagDoc = { _id: string; category: string; user?: string };

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection<{ _id: string; category: string; user?: string }>("tags");

// Helpers
const norm = (v: unknown) =>
    String(v ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pickTag = (raw: any) => ({
    name: norm(raw?.name ?? raw?.tagName),
    category: norm(raw?.category ?? raw?.tagCategory),
});

const isScoped = (cat: string) => cat === "user" || cat === "department";

export async function GET() {
    try {
        const email = await requireEmail();

        const docs = await collection
            .find({
                $or: [
                    { category: { $nin: ["user", "department"] } }, // public tags
                    { category: { $in: ["user", "department"] }, user: email }, // user-scoped tags for this user
                ],
            })
            .toArray();

        // Remove ::email from scoped tags for the response
        const tags = docs.map(({ _id, category, user }) => {
            if (category === "user" || category === "department") {
                const [name] = _id.split("::", 2);
                return { _id: name, category, user }; // keep `user` if you want; safe to omit if not needed
            }
            return { _id, category, user };
        });

        return new Response(JSON.stringify(tags), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        if (error instanceof Response) return error;

        console.error("Error fetching tags:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch tags" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function POST(request: Request) {
    try {
        const email = await requireEmail();
        const body = await request.json();
        const items = Array.isArray(body) ? body : [body];

        if (items.length === 0) {
            return new Response("No tags provided", { status: 400 });
        }

        const ops: AnyBulkWriteOperation<TagDoc>[] = items.map((raw) => {
            const { name, category } = pickTag(raw); // your helper
            if (!name || !category) throw new Error("Each tag must have both name and category");

            const scoped = isScoped(category); // user|department
            const _id = scoped ? `${name}::${email}` : name;

            const update: UpdateFilter<TagDoc> = scoped
                ? {
                      $set: { category, user: email },
                  }
                : {
                      $set: { category },
                      // IMPORTANT: literal value so TS accepts it
                      $unset: { user: "" as const },
                  };

            return {
                updateOne: {
                    filter: { _id },
                    update,
                    upsert: true,
                },
            };
        });

        // Use the doBulkOperation helper (removed incorrect type casting)
        const result = await collection.bulkWrite(ops);
        return handleBulkWriteResult(result);
    } catch (error) {
        if (error instanceof Response) return error; // Propagate Response errors directly

        console.error("Error adding tags:", error);
        // Consistent with handleBulkWriteResult format
        return new Response(JSON.stringify({ success: false }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function DELETE(request: Request) {
    try {
        const email = await requireEmail();

        const contentType = request.headers.get("content-type") || "";
        let name = "";
        let category = "";

        if (contentType.includes("application/json")) {
            const body = await request.json();
            ({ name, category } = pickTag(body));
        } else {
            // Public-only legacy style (raw text body)
            name = norm(await request.text());
            category = ""; // treated as public
        }

        if (!name) {
            return new Response("Tag name is required", { status: 400 });
        }

        const _id = isScoped(category) ? `${name}::${email}` : name;
        const { deletedCount } = await collection.deleteOne({ _id });

        return new Response(JSON.stringify({ success: deletedCount > 0, deletedCount }), {
            status: deletedCount ? 200 : 404,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        if (error instanceof Response) return error;
        console.error("Error deleting tag:", error);
        return new Response("Failed to delete tag", { status: 500 });
    }
}
