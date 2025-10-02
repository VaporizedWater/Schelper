import clientPromise from "@/lib/mongodb";
import { requireEmail } from "@/lib/requireEmail";
import { Collection, ObjectId } from "mongodb";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("users") as Collection<Document>;

export async function PUT(request: Request): Promise<Response> {
    try {
        const userEmail = await requireEmail();

        const { calendarId } = await request.json();

        if (!calendarId) {
            return new Response(JSON.stringify({ success: false, error: "Invalid calendar Id" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (!ObjectId.isValid(calendarId)) {
            return new Response(JSON.stringify({ success: false, error: "Invalid calendar Id format" }), {
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
                    error: "User not found or calendar not in user calendars",
                }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        if (error instanceof Response) return error; // Propagate Response errors directly

        console.error("Error in PUT /api/combined_classes:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
