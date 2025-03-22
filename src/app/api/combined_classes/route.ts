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
    console.time("combined_classes_GET:total");
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

        console.timeEnd("combined_classes_GET:total");
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/classes:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

// export async function GET(request: Request) {
//     console.time("combined_classes_GET:total");
//     try {
//         const headerId = request.headers.get("ids");

//         // Direct query approach instead of aggregation pipeline
//         let query = {};

//         // Apply ID filter if present
//         if (headerId && headerId !== "") {
//             const validIds = headerId
//                 .split(",")
//                 .filter((id) => ObjectId.isValid(id))
//                 .map((id) => new ObjectId(id));

//             if (validIds.length === 0) {
//                 return new Response(JSON.stringify({ error: "Invalid IDs provided" }), { status: 400 });
//             }

//             query = { _id: { $in: validIds } };
//         }

//         // Simple find operation is faster than aggregation for this case
//         const data = await collection.find(query).toArray();

//         if (!data.length) {
//             return new Response(JSON.stringify({ error: "No classes found" }), { status: 404 });
//         }

//         console.timeEnd("combined_classes_GET:total");
//         return new Response(JSON.stringify(data), {
//             status: 200,
//             headers: {
//                 "Content-Type": "application/json",
//                 "Cache-Control": "max-age=60", // Add caching for 60 seconds
//             },
//         });
//     } catch (error) {
//         console.error("Error in GET /api/classes:", error);
//         return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
//     }
// }

export async function POST(request: Request) {
    try {
        const combinedClasses: CombinedClass[] = await request.json();

        const bulkOperations:
            | AnyBulkWriteOperation<Document>[]
            | { insertOne: { document: { data: Class; properties: ClassProperty; events: EventInput | undefined } } }[] = [];

        combinedClasses.forEach((cls: CombinedClass) => {
            // const { _id, ...updateData } = cls;

            const { _id, ...updateData } = cls;

            // Do some rubbish with id for now
            if (_id) {
            }

            bulkOperations.push({
                insertOne: {
                    document: {
                        ...updateData,
                    },
                },
            });
        });

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

        const bulkOperations: AnyBulkWriteOperation<Document>[] = [];

        combinedClasses.forEach((cls: CombinedClass) => {
            if (cls._id && cls._id !== "") {
                // Convert string _id to ObjectId if needed
                const objectId = new ObjectId(cls._id);

                // IMPORTANT: Remove _id from the update document
                const { _id, ...updateData } = cls;

                if (_id) {
                    // Do some rubbish with id for now. Just for the build.
                }

                bulkOperations.push({
                    updateOne: {
                        filter: { _id: objectId },
                        update: {
                            $set: updateData,
                        },
                    },
                });
            } else {
                // Create a more specific filter to uniquely identify classes
                const filter = {
                    "data.catalog_num": cls.data.catalog_num,
                    "data.class_num": cls.data.class_num,
                    "data.session": cls.data.session,
                    "data.course_subject": cls.data.course_subject,
                    "data.course_num": cls.data.course_num,
                    "data.section": cls.data.section,
                    "properties.room": cls.properties.room,
                    "properties.instructor_name": cls.properties.instructor_name,
                    "properties.days": cls.properties.days,
                    "properties.start_time": cls.properties.start_time,
                    "properties.end_time": cls.properties.end_time,
                };

                const { _id, ...updateData } = cls;

                if (_id) {
                    // Do some rubbish with id for now. Just for the build.
                }

                bulkOperations.push({
                    updateOne: {
                        filter: filter,
                        update: { $set: updateData },
                        upsert: true,
                    },
                });
            }
        });

        return doBulkOperation(bulkOperations);
    } catch (error) {
        console.error("Error in PUT /api/combined_classes:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function DELETE(request: Request): Promise<Response> {
    try {
        const classIds: string[] = await request.json();

        if (!Array.isArray(classIds)) {
            return new Response(
                JSON.stringify({ success: false, error: "Invalid request format - expected array of IDs" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const bulkOperations: AnyBulkWriteOperation<Document>[] = [];

        classIds.forEach((id: string) => {
            if (id && id !== "" && ObjectId.isValid(id)) {
                const objectId = new ObjectId(id);

                bulkOperations.push({
                    deleteOne: {
                        filter: { _id: objectId },
                    },
                });
            }
        });

        if (bulkOperations.length === 0) {
            return new Response(JSON.stringify({ success: false, error: "No valid IDs provided" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        return doBulkOperation(bulkOperations);
    } catch (error) {
        console.error("Error in DELETE /api/combined_classes:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
