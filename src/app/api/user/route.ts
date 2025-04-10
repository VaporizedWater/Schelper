"use server";

import clientPromise from "@/lib/mongodb";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("users");

export async function GET(request: Request) {
    try {
        const email = request.headers.get("userEmail");
        if (!email || email === "") {
            return new Response(JSON.stringify("Header: \'calendarId\' is missing or invalid"), { status: 400 });
        }

        const document = await collection.findOne({ email: email });

        if (!document) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        return new Response(JSON.stringify(document), { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/classes:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}