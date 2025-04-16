import clientPromise from "@/lib/mongodb";
import { Collection } from "mongodb";


const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("intial_states") as Collection<Document>;

export async function GET(request: Request) {
    // Get headers from request
    const { headerItem } = await request.json() as { headerItem: any };

    try {
        // Set up the MongoDB aggregation pipeline
        const pipeline = [
            {
                $match: {
                    headerItem: headerItem
                }
            },
        ]

        // Perform the aggregation
        const data = await collection.aggregate(pipeline).toArray();

        // Check if data is empty and return appropriate response
        if (!data.length) {
            return new Response(JSON.stringify({ error: "No data found" }), { status: 404 });
        } else {
            return new Response(JSON.stringify(data), { status: 200 });
        }
    } catch (error) {
        // Handle errors and return appropriate response
        console.error("Error in GET request:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function PUT(request: Request) {
    try {
        // Get headers from request
        const { headerItem, headerItem2 } = await request.json() as { headerItem: string, headerItem2: string };

        // Payload formatting
        const filter = { headerItem: headerItem };
        const updateData = { headerItem2: headerItem2 };
        const options = {
            returnDocument: "after",
            upsert: true,
        };

        // Perform the update operation
        const result = await collection.updateOne(filter, { $set: updateData }, options);

        // Check if the operation was successful and return response
        if (result.acknowledged) {
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } else {
            return new Response(JSON.stringify({ success: false }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    } catch (error) {
        // Handle errors and return appropriate response
        console.error("Error in POST request:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}