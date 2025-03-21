"use server";

import clientPromise from "@/lib/mongodb";
import { Class, ClassProperty, CombinedClass } from "@/lib/types";
import { EventInput } from "@fullcalendar/core/index.js";
import { AnyBulkWriteOperation, Collection, Document, ObjectId } from "mongodb";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("combined_classes") as Collection<Document>;

async function doBulkOperation(bulkOps: AnyBulkWriteOperation<Document>[]): Promise<Response> {
    const result = await collection.bulkWrite(bulkOps);

    if (result.ok) {
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
}

export async function GET(request: Request) {
    try {
        const headerId = request.headers.get("ids");
        const pipeline = [];

        // Check if IDs are provided and are valid
        if (headerId && headerId !== "") {
            const ids = headerId
                .split(",")
                .filter((id) => ObjectId.isValid(id))
                .map((id) => new ObjectId(id));
            if (ids.length === 0) {
                return new Response(JSON.stringify({ error: "Invalid IDs provided" }), { status: 400 });
            }
            // Filter by multiple IDs
            pipeline.push({ $match: { _id: { $in: ids } } }); // $in = https://www.mongodb.com/docs/manual/reference/operator/query/in/
        }

        // Define the projection to format documents according to the CombinedClass structure
        pipeline.push({
            $project: {
                _id: "$_id", // Explicitly project the _id to ensure it's clearly retained
                data: "$data",
                properties: "$properties",
            },
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

        const bulkOperations: AnyBulkWriteOperation<Document>[] | { insertOne: { document: { data: Class; properties: ClassProperty; events: EventInput | undefined; }; }; }[] = [];

        combinedClasses.forEach((cls: CombinedClass) => {
            const { _id, ...updateData } = cls;

            bulkOperations.push(
                {
                    insertOne: {
                        document: {
                            ...updateData,
                        }
                    }
                }
            )
        })

        return doBulkOperation(bulkOperations);
    } catch (error) {
        console.error("Error in POST /api/combined_classes:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function PUT(request: Request): Promise<Response> {
    try {
        const combinedClasses: CombinedClass[] = await request.json();

        const bulkOperations: AnyBulkWriteOperation<Document>[] | { updateOne: { filter: { "data.catalog_num": string; "data.class_num": string; "data.session": string; "data.course_subject": string; "data.course_num": string; }; update: { $set: { data: Class; properties: ClassProperty; events: EventInput | undefined; }; }; upsert: boolean; }; }[] = [];

        combinedClasses.forEach((cls: CombinedClass) => {
            const { _id, ...updateData } = cls;

            let ID;
            if (_id === "" || ObjectId.isValid(_id)) {
                ID = new ObjectId()
            } else {
                ID = new ObjectId(_id);
            }

            bulkOperations.push(
                {
                    updateOne: {
                        filter: {
                            "data.catalog_num": updateData.data.catalog_num,
                            "data.class_num": updateData.data.class_num,
                            "data.session": updateData.data.session,
                            "data.course_subject": updateData.data.course_subject,
                            "data.course_num": updateData.data.course_num,
                        },
                        update: { $set: updateData },
                        upsert: true,
                    }
                }
            )
        })

        return doBulkOperation(bulkOperations);

    } catch (error) {
        console.error("Error in PUT /api/combined_classes:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
