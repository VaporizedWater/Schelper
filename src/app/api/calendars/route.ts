import clientPromise from "@/lib/mongodb";
import { Collection, ObjectId } from "mongodb";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("users") as Collection<Document>;

export async function GET(request: Request): Promise<Response> {
    try {
        const userEmail = request.headers.get("userEmail");

        const pipeline = [
            {
                $match: { email: userEmail }
            },
            {
                $lookup: {
                    from: "calendars",
                    let: { calendarIds: "$user_calendars" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ["$_id", "$$calendarIds"] }
                            }
                        },
                        {
                            $project: {
                                info: 1,
                                semesterSort: {
                                    $switch: {
                                        branches: [
                                            { case: { $eq: ["$info.semester", "Spring"] }, then: 1 },
                                            { case: { $eq: ["$info.semester", "Summer"] }, then: 1.5 },
                                            { case: { $eq: ["$info.semester", "Fall"] }, then: 2 }
                                        ],
                                        default: 0
                                    }
                                },
                                yearSort: { $toInt: "$info.year" },
                                _id: 0
                            }
                        },
                        { $sort: { yearSort: -1, semesterSort: -1 } },
                        { $replaceRoot: { newRoot: "$info" } }
                    ],
                    as: "skibidi" // Have to prepare this app for a possible future new-gen senior design team, also... will anyone see this?
                }
            },
            { $unwind: "$skibidi" },
            { $replaceRoot: { newRoot: "$skibidi" } }
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

export async function PUT(request: Request): Promise<Response> {
    try {
        const { userId, calendarId } = (await request.json()) as { userId: string, calendarId: string; };

        if (ObjectId.isValid(calendarId) && ObjectId.isValid(userId)) {
            const calendar = new ObjectId(calendarId);

            await collection.findOneAndUpdate(
                { _id: new ObjectId(userId) },
                { $addToSet: { classes: { calendar } } },
                { upsert: true }
            );
        }

        return new Response(
            JSON.stringify({ success: true }),
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



// export async function GET(request: Request): Promise<Response> {
//     console.warn("Request: ",request);
//     throw new Error("Not Implemented");
// }

// export async function PUT(request: Request): Promise<Response> {
//     console.warn("Request: ",request);
//     throw new Error("Not Implemented");
// }
