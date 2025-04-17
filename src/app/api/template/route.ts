/*
    This is an intentionally non-functional template you can use to create new API routers for each type of request we use. 
    Next step is to create a function in DatabaseUtils to act as a proxy between the API and the components/pages to ensure formatting of requests.
    Check the combined_classes API for the best example on how to use this template, if this is not clear.
*/

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";


const client = await clientPromise;
const collection = client.db("DATABASE_NAME").collection<{ headerId?: string, headerItem: any }>("COLLECTION_NAME");

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

export async function POST(request: Request) {
    try {
        // Get headers from request
        const { headerItem } = await request.json() as { headerItem: any };

        // Payload formatting
        const document: { headerItem: any } = {
            headerItem: headerItem,
        };

        // Perform the update operation
        const result = await collection.insertOne(document);

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

export async function PUT(request: Request) {
    try {
        // Get headers from request
        const { headerItem } = await request.json() as { headerItem: any };

        // Payload formatting
        const filter = { headerItem: headerItem };
        const updateData = { $set: { headerItem: headerItem } };
        const options: { returnDocument: "after"; upsert: boolean } = {
            returnDocument: "after",
            upsert: true,
        };

        // Perform the update operation
        const result = await collection.updateOne(filter, updateData, options);

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

export async function DELETE(request: Request) {
    try {
        // Get headers from request
        const { headerId, headerItem } = await request.json() as { headerId?: string, headerItem: any };

        // Validate headerId
        if (!headerId && ObjectId.isValid(headerId ? headerId : "")) {
            return new Response(JSON.stringify({ error: "Header ID is required" }), {
                status: 400,
            });
        }

        // Perform the delete operation by doing an update with $pull
        const result = await collection.updateOne(
            { _id: new ObjectId(headerId) },
            {
                $pull: {
                    headerItem: headerItem
                }
            }
        );

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
        console.error("Error in DELETE /api/combined_classes:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}