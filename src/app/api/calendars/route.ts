import clientPromise from "@/lib/mongodb";
import { Collection, ObjectId } from "mongodb";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("users") as Collection<Document>;

export async function GET(request: Request): Promise<Response> {
    try {
        const userEmail = request.headers.get("userEmail");

        const pipeline = [
            {
                $match: { email: userEmail },
            },
            {
                $lookup: {
                    from: "calendars",
                    let: { calendarIds: "$user_calendars" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ["$_id", "$$calendarIds"] },
                            },
                        },
                        {
                            $project: {
                                info: 1,
                                semesterSort: {
                                    $switch: {
                                        branches: [
                                            { case: { $eq: ["$info.semester", "Spring"] }, then: 1 },
                                            { case: { $eq: ["$info.semester", "Summer"] }, then: 1.5 },
                                            { case: { $eq: ["$info.semester", "Fall"] }, then: 2 },
                                        ],
                                        default: 0,
                                    },
                                },
                                yearSort: { $toInt: "$info.year" },
                                _id: 0,
                            },
                        },
                        { $sort: { yearSort: -1, semesterSort: -1 } },
                        { $replaceRoot: { newRoot: "$info" } },
                    ],
                    as: "skibidi", // Have to prepare this app for a possible future new-gen senior design team, also... will anyone see this?
                },
            },
            { $unwind: "$skibidi" },
            { $replaceRoot: { newRoot: "$skibidi" } },
        ];

        const data = await collection.aggregate(pipeline).toArray();

        if (!data.length) {
            return new Response(JSON.stringify({ error: "No classes found" }), { status: 404 });
        }

        const json = JSON.stringify(data);
        return new Response(json, { status: 200 });
    } catch (error) {
        console.error("Error in PUT /api/combined_classes:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function POST(request: Request): Promise<Response> {
    try {
        // 1) Parse body
        const { userEmail, calendarData } = await request.json();

        if (!userEmail || !calendarData) {
            return new Response(JSON.stringify({ success: false, error: "Invalid user or calendar ID" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 2) Get DB & collections
        const client = await clientPromise;
        const db = client.db("class-scheduling-app");
        const usersColl = db.collection("users") as Collection<Document>;
        const calsColl = db.collection("calendars") as Collection<Document>;

        // 3) Prepare a new calendar document with a placeholder for _id
        //    We'll let Mongo assign _id, then inject it into info._id
        //    by doing a two‐step insert+update.
        const insertResult = await calsColl.insertOne({
            ...calendarData,
            // ensure info exists
            info: {
                ...calendarData.info,
                // placeholder; will overwrite immediately
                _id: null,
            },
        });
        if (!insertResult.insertedId) {
            throw new Error("Failed to create calendar");
        }
        const newCalId = insertResult.insertedId;

        // 4) Patch the calendar's info._id to match its real _id
        await calsColl.updateOne({ _id: newCalId }, { $set: { "info._id": newCalId } });

        // 5) Add this calendar _id to the user's user_calendars array
        const updateResult = await usersColl.findOneAndUpdate(
            { email: userEmail },
            { $addToSet: { user_calendars: newCalId } },
            { returnDocument: "after" }
        );

        if (!updateResult) {
            // Rollback: remove the calendar we just created
            await calsColl.deleteOne({ _id: newCalId });
            return new Response(JSON.stringify({ success: false, error: "User not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 6) Success
        return new Response(JSON.stringify({ success: true, calendarId: newCalId }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error in POST /api/calendars:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function PUT(request: Request): Promise<Response> {
    try {
        const { userEmail, calendarId } = await request.json();

        if (!userEmail || !calendarId) {
            return new Response(JSON.stringify({ success: false, error: "Invalid userEmail or calendarId" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (!ObjectId.isValid(calendarId) || !userEmail) {
            return new Response(JSON.stringify({ success: false, error: "Invalid userEmail or calendarId format" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const client = await clientPromise;
        const db = client.db("class-scheduling-app");
        const usersColl = db.collection("users") as Collection<Document>;

        const objectCalId = ObjectId.createFromHexString(calendarId);

        const result = await usersColl.updateOne(
            {
                email: userEmail,
                user_calendars: objectCalId, // ensure the user actually has that calendar
            },
            {
                $set: { current_calendar: objectCalId }, // update the current_calendar field
            }
        );

        if (result.matchedCount === 0) {
            // either no such user, or calendarId not in their user_calendars
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "User not found or calendar not in user_calendars",
                }),
                { status: 404, headers: { "Content-Type": "application/json" } }
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
        const { userEmail, calendarId } = await request.json();

        if (!userEmail || !calendarId) {
            return new Response(JSON.stringify({ success: false, error: "Invalid user or calendar ID" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const client = await clientPromise;
        const db = client.db("class-scheduling-app");
        const usersColl = db.collection("users") as Collection<Document>;
        const calsColl = db.collection("calendars") as Collection<Document>;

        // Remove the calendar from the user's user_calendars array
        await usersColl.updateOne({ email: userEmail }, { $pull: { user_calendars: new ObjectId(calendarId) } });

        // Delete the calendar document itself
        await calsColl.deleteOne({ _id: new ObjectId(calendarId) });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error in DELETE /api/calendars:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
