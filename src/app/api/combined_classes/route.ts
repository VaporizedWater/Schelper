"use server";

import clientPromise from "@/lib/mongodb";
import { Class, ClassProperty, CombinedClass } from "@/lib/types";
import { EventInput } from "@fullcalendar/core/index.js";
import {
    AnyBulkWriteOperation,
    BulkWriteResult,
    Collection,
    Document,
    InsertManyResult,
    ObjectId,
    OptionalId,
} from "mongodb";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("combined_classes") as Collection<Document>;

async function doBulkOperation(bulkOps: AnyBulkWriteOperation<Document>[]): Promise<Response> {
    const result = await collection.bulkWrite(bulkOps);

    return handleBulkWriteResult(result);
}

function handleBulkWriteResult(result: BulkWriteResult) {
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

function handleInsertManyResult(result: InsertManyResult) {
    if (result.insertedCount > 0) {
        return new Response(JSON.stringify({ success: true, count: result.insertedCount }), {
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
    const collection = client.db("class-scheduling-app").collection("calendars");

    try {
        const headerId = request.headers.get("calendarId");
        if (!headerId || !ObjectId.isValid(headerId)) {
            return new Response(JSON.stringify("Header: \'calendarId\' is missing or invalid"), { status: 400 });
        }

        const pipeline = [];
        const calenderID = new ObjectId(headerId);
        pipeline.push({
            $match: {
                _id: calenderID
            }
        });

        pipeline.push({
            $lookup: {
                from: "combined_classes",
                localField: "classes",
                foreignField: "_id",
                as: "classDetails"
            }
        })
        // Define the projection to format documents according to the CombinedClass structure
        pipeline.push({
            $project: {
                _id: 0,
                classes: {
                    $map: {
                        input: "$classDetails",
                        as: "class",
                        in: {
                            _id: { $toString: "$$class._id" },
                            data: "$$class.data",
                            properties: "$$class.properties"
                        }
                    }
                }
            }
        });

        pipeline.push({
            $unwind: "$classes"
        });
        
        pipeline.push({
            $replaceRoot: {
                newRoot: "$classes"
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
        const documents:
            | OptionalId<Document>[]
            | { data: Class; properties: ClassProperty; events: EventInput | undefined }[] = [];

        combinedClasses.forEach((cls: CombinedClass) => {
            const { _id, ...updateData } = cls; // eslint-disable-line @typescript-eslint/no-unused-vars
            documents.push(updateData);
        });

        const result = await collection.insertMany(documents);

        return handleInsertManyResult(result);
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
            const { _id, ...updateData } = cls;

            if (_id && _id !== "") {
                const objectId = new ObjectId(_id);

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
