import clientPromise from "@/lib/mongodb";
import { requireEmail } from "@/lib/requireEmail";
import { Collection, ObjectId } from "mongodb";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("users") as Collection<Document>;

export async function GET(): Promise<Response> {
    try {
        const userEmail = await requireEmail();

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
                    as: "result",
                },
            },
            { $unwind: "$result" },
            { $replaceRoot: { newRoot: "$result" } },
        ];

        const data = await collection.aggregate(pipeline).toArray();

        if (!data.length) {
            return new Response(JSON.stringify({ error: "No classes found" }), { status: 404 });
        }

        const json = JSON.stringify(data);
        return new Response(json, { status: 200 });
    } catch (error) {
        if (error instanceof Response) return error; // Propagate Response errors directly

        console.error("Error in PUT /api/combined_classes:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function POST(request: Request): Promise<Response> {
    try {
        const userEmail = await requireEmail();

        // 1) Parse body
        const { calendarData } = await request.json();

        if (!calendarData) {
            return new Response(JSON.stringify({ success: false, error: "Invalid calendar ID" }), {
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

        // 5) Add this calendar _id to the user's user_calendars array and make it the current calendar
        const updateResult = await usersColl.findOneAndUpdate(
            { email: userEmail },
            {
                $addToSet: { user_calendars: newCalId }, // add calendar to user_calendars
                $set: { current_calendar: newCalId }, // set as current calendar
            },
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
        if (error instanceof Response) return error; // Propagate Response errors directly

        console.error("Error in POST /api/calendars:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function DELETE(request: Request): Promise<Response> {
    try {
        const userEmail = await requireEmail();

        const { calendarId } = await request.json();

        if (!calendarId) {
            return new Response(JSON.stringify({ success: false, error: "Invalid calendar ID" }), {
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

        // Set the user's current_calendar to null if there are no other calendars else set it to the first one in the array
        const user = (await usersColl.findOne({ email: userEmail })) as (typeof usersColl extends Collection<infer U>
            ? U
            : any) & { user_calendars?: ObjectId[] }; // eslint-disable-line @typescript-eslint/no-explicit-any
        if (user && Array.isArray(user.user_calendars) && user.user_calendars.length > 0) {
            const newCurrentCalendar = user.user_calendars[0]; // Set to the first calendar in the array
            await usersColl.updateOne({ email: userEmail }, { $set: { current_calendar: newCurrentCalendar } });
        } else {
            await usersColl.updateOne({ email: userEmail }, { $set: { current_calendar: null } });
        }

        // Delete the calendar document itself
        await calsColl.deleteOne({ _id: new ObjectId(calendarId) });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        if (error instanceof Response) return error; // Propagate Response errors directly

        console.error("Error in DELETE /api/calendars:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
