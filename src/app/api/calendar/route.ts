"use server";

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("calendars");

export async function GET(request: Request) {
    const calendarId = request.headers.get("calendarId");

    if (calendarId && calendarId !== "" && ObjectId.isValid(calendarId)) {
        const parsedId = new ObjectId(calendarId);

        const calendar = await collection.findOne({ _id: parsedId });

        if (!calendar) {
            return new Response(JSON.stringify({ success: false, message: "Calendar not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ success: true, calendar }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ success: false, message: "Invalid calendar ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
    });
}

export async function POST(request: Request) {
    console.log(request);
}

export async function PUT() {}
