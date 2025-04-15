import clientPromise from "@/lib/mongodb";
import { handleBulkWriteResult } from "@/lib/routerUtils";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection<{ _id: string; category: string }>("tags");

export async function GET() {
    try {
        const tagsReturned = await collection.find().toArray();

        if (!tagsReturned) {
            return new Response(JSON.stringify({ error: "Tag not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify(tagsReturned), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching tags:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch tags" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Support both single tag and array of tags
        const tagsData = Array.isArray(body) ? body : [body];

        if (tagsData.length === 0) {
            return new Response("No tags provided", { status: 400 });
        }

        // Prepare bulk operations with upsert
        const bulkOps = tagsData.map(({ name, category }) => {
            if (!name || !category) {
                throw new Error("Each tag must have both name and category");
            }

            const tagName = name.toLowerCase().replace(/\s+/g, "");
            const tagCategory = category.toLowerCase().replace(/\s+/g, "");

            return {
                updateOne: {
                    filter: { _id: tagName },
                    update: { $set: { category: tagCategory } },
                    upsert: true,
                },
            };
        });

        // Use the doBulkOperation helper (removed incorrect type casting)
        const result = await collection.bulkWrite(bulkOps);
        return handleBulkWriteResult(result);
    } catch (error) {
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
        // Read and process the tag name: lowercase and remove spaces
        let tagName = (await request.text()).trim();
        if (!tagName) {
            return new Response("Tag name is required", { status: 400 });
        }
        tagName = tagName.toLowerCase().replace(/\s+/g, "");
        // Delete the tag with _id set to the processed tagName
        await collection.deleteOne({ _id: tagName });
        return new Response("Tag deleted successfully", { status: 200 });
    } catch (error) {
        console.error("Error deleting tag:", error);
        return new Response("Failed to delete tag", { status: 500 });
    }
}
