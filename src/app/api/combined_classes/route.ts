"use server";

import clientPromise from "@/lib/mongodb";
import { ClassData, ClassProperty, CombinedClass, FacultyType } from "@/lib/types";
import { EventInput } from "@fullcalendar/core/index.js";
import { Collection, Document, ObjectId, OptionalId } from "mongodb";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("combined_classes") as Collection<Document>;

export async function GET(request: Request) {
    const collection = client.db("class-scheduling-app").collection("users");

    try {
        const userEmail = request.headers.get("userEmail");
        if (!userEmail || userEmail.split("@").length !== 2) {
            return new Response(JSON.stringify("Header: 'userEmail' is missing or invalid"), { status: 400 });
        }

        const pipeline = [
            {
                $match: {
                    email: userEmail,
                },
            },
            {
                $lookup: {
                    from: "calendars",
                    localField: "current_calendar",
                    foreignField: "_id",
                    as: "calendarDetails",
                },
            },
            {
                $unwind: "$calendarDetails",
            },
            {
                $lookup: {
                    from: "combined_classes",
                    localField: "calendarDetails.classes",
                    foreignField: "_id",
                    as: "classDetails",
                },
            },
            {
                $project: {
                    _id: "$current_calendar",
                    info: {
                        _id: { $toString: "$calendarDetails.info._id" },
                        semester: "$calendarDetails.info.semester",
                        year: "$calendarDetails.info.year",
                        name: "$calendarDetails.info.name",
                    },
                    classes: {
                        $map: {
                            input: "$classDetails",
                            as: "class",
                            in: {
                                _id: { $toString: "$$class._id" },
                                data: "$$class.data",
                                properties: "$$class.properties",
                                visible: true,
                            },
                        },
                    },
                },
            },
        ];

        const data = await collection.aggregate(pipeline).toArray();

        // console.log("GET /api/combined_classes response data:", data);

        if (!data.length) {
            return new Response(JSON.stringify({ error: "No classes found!" }), { status: 404 });
        }

        return new Response(JSON.stringify(data[0]), { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/classes:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { calendarId, classes } = (await request.json()) as { calendarId?: string; classes: CombinedClass[] };

        const documents:
            | OptionalId<Document>[]
            | { data: ClassData; properties: ClassProperty; events: EventInput | undefined }[] = [];

        classes.forEach((cls: CombinedClass) => {
            const { _id, ...updateData } = cls; // eslint-disable-line @typescript-eslint/no-unused-vars
            documents.push(updateData);
        });

        const result = await collection.insertMany(documents);

        if (result.acknowledged && result.insertedCount > 0) {
            const calendarObjectId = new ObjectId(calendarId);
            const classIds = Object.values<ObjectId>(result.insertedIds);
            await client
                .db("class-scheduling-app")
                .collection("calendars")
                .updateOne({ _id: calendarObjectId }, { $addToSet: { classes: { $each: classIds } } }, { upsert: true });

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
        const { calendarId, classes, facultyData, skipTags } = (await request.json()) as {
            calendarId?: string;
            classes: CombinedClass[];
            facultyData?: FacultyType[];
            skipTags?: boolean;
        };

        console.log(calendarId + "CALENDAR");
        console.log(classes);

        // First, find IDs of documents that already exist without an _id field
        const classesWithIds = classes.filter((cls) => cls._id && cls._id !== "");
        const classesWithoutIds = classes.filter((cls) => !cls._id || cls._id === "");

        // Create a bulk find operation to get existing class IDs in one batch
        const existingClassFilters = classesWithoutIds.map((cls) => ({
            "data.catalog_num": cls.data.catalog_num,
            "data.class_num": cls.data.class_num,
            "data.session": cls.data.session,
            "data.course_subject": cls.data.course_subject,
            "data.course_num": cls.data.course_num,
            "data.section": cls.data.section,
            "properties.room": cls.properties.room,
            "properties.instructor_name": cls.properties.instructor_name,
            "properties.days": cls.properties.days,
        }));

        // Only perform find if we have classes without IDs
        let preExistingIds: ObjectId[] = [];
        if (existingClassFilters.length > 0) {
            const existingDocs = await collection
                .find(
                    {
                        $or: existingClassFilters,
                    },
                    { projection: { _id: 1 } }
                )
                .toArray();

            preExistingIds = existingDocs.map((doc) => doc._id);
        }

        // Prepare bulk operations array
        const bulkOperations = classes.map((cls) => {
            const { _id, ...updateData } = cls;

            // Clone and strip out user tags if needed

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const setData: any = {
                data: updateData.data,
                properties: updateData.properties,
            };
            if (skipTags || (Array.isArray(setData.properties.tags) && setData.properties.tags.length === 0)) {
                delete setData.properties.tags;
            }

            if (_id && _id !== "") {
                // Update existing class by ID
                return {
                    updateOne: {
                        filter: { _id: new ObjectId(_id) },
                        update: {
                            $set: {
                                ...setData,
                                lastUpdated: new Date(),
                                _random: Math.random(), // Force an update
                            },
                        },
                    },
                };
            } else {
                // Upsert based on unique class properties
                return {
                    updateOne: {
                        filter: {
                            "data.catalog_num": cls.data.catalog_num,
                            "data.class_num": cls.data.class_num,
                            "data.session": cls.data.session,
                            "data.course_subject": cls.data.course_subject,
                            "data.course_num": cls.data.course_num,
                            "data.section": cls.data.section,
                            "properties.room": cls.properties.room,
                            "properties.instructor_name": cls.properties.instructor_name,
                            "properties.days": cls.properties.days,
                        },
                        update: {
                            $set: {
                                ...setData,
                                lastUpdated: new Date(),
                                _random: Math.random(), // Force an update
                            },
                        },
                        upsert: true,
                    },
                };
            }
        });

        // Execute all operations in a single database call
        const bulkResult = await collection.bulkWrite(bulkOperations);

        // Collect IDs of all updated/inserted documents
        const existingIds = classesWithIds.map((cls) => new ObjectId(cls._id));
        const upsertedIds = Object.values(bulkResult.upsertedIds || {});

        // Include the IDs we found earlier that weren't modified or upserted
        const allIds = [...existingIds, ...upsertedIds, ...preExistingIds];

        // Update calendar with all document IDs (single operation)
        if (calendarId && allIds.length > 0) {
            await client
                .db("class-scheduling-app")
                .collection("calendars")
                .updateOne(
                    { _id: new ObjectId(calendarId) },
                    { $addToSet: { classes: { $each: allIds } } },
                    { upsert: true }
                );
        }

        //Update faculty data if provided
        if (facultyData && facultyData.length > 0) {
            const facultyCollection = client.db("class-scheduling-app").collection<FacultyType>("faculty");
            const facultyBulkOperations = facultyData.map((faculty) => ({
                updateOne: {
                    filter: { email: faculty.email },
                    update: { $set: { ...faculty } },
                    upsert: true,
                },
            }));

            const facultyResult = await facultyCollection.bulkWrite(facultyBulkOperations);

            console.log("Faculty data:", facultyResult);
        }

        return new Response(
            JSON.stringify({
                success: true,
                modifiedCount: bulkResult.modifiedCount,
                upsertedCount: bulkResult.upsertedCount,
                foundExisting: preExistingIds.length,
                totalCount: allIds.length,
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error in PUT /api/combined_classes:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

type CalendarCollection = {
    _id: ObjectId;
    semester: string;
    year: number;
    classes: ObjectId[];
};

export async function DELETE(request: Request): Promise<Response> {
    try {
        const { calendarId, classId } = (await request.json()) as { calendarId?: string; classId: CombinedClass };
        const collection = client.db("class-scheduling-app").collection<CalendarCollection>("calendar");

        const result = await collection.updateOne(
            { _id: new ObjectId(calendarId) },
            {
                $pull: {
                    classes: new ObjectId(classId._id),
                },
            }
        );

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
        console.error("Error in DELETE /api/combined_classes:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
