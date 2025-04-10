"use server";

import clientPromise from "@/lib/mongodb";
import { Class, ClassProperty, CombinedClass } from "@/lib/types";
import { EventInput } from "@fullcalendar/core/index.js";
import {
    AnyBulkWriteOperation,
    BulkWriteResult,
    // BulkWriteResult,
    Collection,
    Document,
    // InsertManyResult,
    ObjectId,
    OptionalId,
} from "mongodb";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("combined_classes") as Collection<Document>;

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

export async function GET(request: Request) {
    const collection = client.db("class-scheduling-app").collection("users");

    try {
        const userEmail = request.headers.get("userEmail");
        if (!userEmail || userEmail.split('@').length !== 2) {
            return new Response(JSON.stringify("Header: \'userEmail\' is missing or invalid"), { status: 400 });
        }

        const pipeline = [
            {
                $match: {
                    email: userEmail
                }
            },
            {
                $lookup: {
                    from: "calendars",
                    localField: "current_calendar",
                    foreignField: "_id",
                    as: "calendarDetails"
                }
            },
            {
                $unwind: "$calendarDetails"
            },
            {
                $lookup: {
                    from: "combined_classes",
                    localField: "calendarDetails.classes",
                    foreignField: "_id",
                    as: "classDetails"
                }
            },
            {
                $project: {

                    _id: "$current_calendar",
                    semester: "$calendarDetails.semester",
                    year: "$calendarDetails.year",
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
            }
        ];

        const data = await collection.aggregate(pipeline).toArray();

        if (!data.length) {
            return new Response(JSON.stringify({ error: "No classes found" }), { status: 404 });
        }

        return new Response(JSON.stringify(data[0]), { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/classes:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { calendarId, classes } = await request.json() as { calendarId?: string, classes: CombinedClass[] };

        const documents:
            | OptionalId<Document>[]
            | { data: Class; properties: ClassProperty; events: EventInput | undefined }[] = [];

        classes.forEach((cls: CombinedClass) => {
            const { _id, ...updateData } = cls; // eslint-disable-line @typescript-eslint/no-unused-vars
            documents.push(updateData);
        });

        const result = await collection.insertMany(documents);

        if (result.acknowledged && result.insertedCount > 0) {
            const calendarObjectId = new ObjectId(calendarId);
            const classIds = Object.values<ObjectId>(result.insertedIds)
            await client.db("class-scheduling-app").collection("calendars").updateOne(
                { _id: calendarObjectId },
                { $addToSet: { classes: { $each: classIds } } },
                { upsert: true }
            );

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
        const { calendarId, classes } = await request.json() as { calendarId?: string, classes: CombinedClass[] };

        const allIds: ObjectId[] = [];

        for (const cls of classes) {
            // Destructure _id from the incoming document data
            const { _id, ...updateData } = cls;
            let filter;
            // Default options: return the document after update and allow upsert.
            // For an existing document, upsert is not needed.
            const options: { returnDocument: "after"; upsert: boolean } = {
                returnDocument: "after",
                upsert: true,
            };

            if (_id && _id !== "") {
                // If _id is provided, update based on _id and do not upsert.
                const objectId = new ObjectId(_id);
                filter = { _id: objectId };
                options.upsert = false;
            } else {
                // Build a filter that uniquely identifies the document.
                filter = {
                    "data.catalog_num": cls.data.catalog_num,
                    "data.class_num": cls.data.class_num,
                    "data.session": cls.data.session,
                    "data.course_subject": cls.data.course_subject,
                    "data.course_num": cls.data.course_num,
                    "data.section": cls.data.section,
                    "properties.room": cls.properties.room,
                    "properties.instructor_name": cls.properties.instructor_name,
                    "properties.days": cls.properties.days
                };
            }

            // Execute the update and capture the returned document.
            const result = await collection.findOneAndUpdate(filter, { $set: updateData }, options);

            if (result) {
                allIds.push(new ObjectId(result["_id"]));
            }
        }

        if (calendarId) {
            const calendarObjectId = new ObjectId(calendarId);
            await client
                .db("class-scheduling-app")
                .collection("calendars")
                .updateOne(
                    { _id: calendarObjectId },
                    { $addToSet: { classes: { $each: allIds } } },
                    { upsert: true }
                );
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
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
        const result = await collection.bulkWrite(bulkOperations);
        return handleBulkWriteResult(result);
    } catch (error) {
        console.error("Error in DELETE /api/combined_classes:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
