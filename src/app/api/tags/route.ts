import clientPromise from "@/lib/mongodb";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection<{ _id: string }>("tags");

export async function GET(request: Request) {
    try {
        // Get tag ID from URL if present
        const { searchParams } = new URL(request.url);
        const tagId = searchParams.get("id");

        // Query based on whether an ID was provided
        if (tagId) {
            const tag = await collection.findOne({ _id: tagId });
            if (!tag) {
                return new Response(JSON.stringify({ error: "Tag not found" }), {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                });
            }
            return new Response(JSON.stringify(tag), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Get all tags if no ID provided
        const tags = await collection.find().toArray();
        return new Response(JSON.stringify(tags), {
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
        // Read and process the tag name: lowercase and remove spaces
        let tagName = (await request.text()).trim();
        if (!tagName) {
            return new Response("Tag name is required", { status: 400 });
        }
        tagName = tagName.toLowerCase().replace(/\s+/g, "");
        // Insert the tag with _id set to the processed tagName
        await collection.insertOne({ _id: tagName });
        return new Response("Tag added successfully", { status: 201 });
    } catch (error) {
        console.error("Error adding tag:", error);
        return new Response("Failed to add tag", { status: 500 });
    }
}

// Delete
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
