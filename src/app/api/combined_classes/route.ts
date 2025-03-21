"use server";

import { documentToCombinedClass } from "@/lib/common";
import clientPromise from "@/lib/mongodb";
import { CombinedClass } from "@/lib/types";
import { AnyBulkWriteOperation, Collection, Document, ObjectId } from "mongodb";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("combined_classes") as Collection<Document>;

async function doBulkOperation(bulkOps: AnyBulkWriteOperation<Document>[]): Promise<Response> {
    const result = await collection.bulkWrite(bulkOps);

    if (result.ok) {
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } else {
        return new Response(JSON.stringify({ success: false }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function GET(request: Request) {
    try {
        const headerId = request.headers.get("ids");
        const pipeline = [];

        if (headerId) {
            const ids = headerId.split(",").filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
            if (ids.length === 0) {
                return new Response(JSON.stringify({ error: "Invalid IDs provided" }), { status: 400 });
            }

            // Filter by multiple IDs
            pipeline.push({ $match: { _id: { $in: ids } } }); // $in = https://www.mongodb.com/docs/manual/reference/operator/query/in/
        }

        // Define the projection to format documents according to the CombinedClass structure
        pipeline.push({
            $project: {
                _id: "$_id",  // Explicitly project the _id to ensure it's clearly retained
                classData: "$Data",
                classProperties: "$Properties"
            }
        });

        const data = await collection.aggregate(pipeline).toArray();

        if (!data.length) {
            return new Response(JSON.stringify({ error: "No classes found" }), { status: 404 });
        }

        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/classes:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const combinedClasses: CombinedClass[] = await request.json();

        const bulkOps = combinedClasses.map(combinedClass => ({
            insertOne: {
                document: {
                    ...combinedClass,
                    _id: combinedClass._id ? new ObjectId(combinedClass._id) : new ObjectId()
                }
            }
        }));

        return doBulkOperation(bulkOps);
    } catch (error) {
        console.error("Error in PUT /api/combined_classes:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function PUT(request: Request): Promise<Response> {
    try {
        const combinedClasses: CombinedClass[] = await request.json();

        const bulkOps = combinedClasses.map(cc => ({
            updateOne: {
                filter: { _id: new ObjectId(cc._id) }, // Ensures the document matches by _id
                update: { $set: cc },
                upsert: true // Inserts as a new document if it does not exist
            }
        }));

        return doBulkOperation(bulkOps);
    } catch (error) {
        console.error("Error in PUT /api/combined_classes:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}