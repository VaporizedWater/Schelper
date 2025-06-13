"use server";

import clientPromise from "@/lib/mongodb";
import { UserType } from "@/lib/types";

export async function GET(request: Request) {
    try {
        const userEmail = request.headers.get("userEmail");
        if (!userEmail || userEmail.split("@").length !== 2) {
            return new Response(JSON.stringify({ error: "Header: 'userEmail' is missing or invalid" }), { status: 400 });
        }

        const client = await clientPromise;
        const usersCollection = client.db("class-scheduling-app").collection<UserType>("users");

        const user = await usersCollection.findOne({ email: userEmail }, { projection: { _id: 0, settings: 1 } });

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        // If no settings yet, return empty object
        const settings = user.settings || {};
        return new Response(JSON.stringify({ settings }), { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/settings:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { userEmail, settings } = await request.json();

        if (!userEmail || userEmail.split("@").length !== 2) {
            return new Response(JSON.stringify({ error: "'userEmail' is missing or invalid" }), { status: 400 });
        }

        if (typeof settings !== "object" || settings === null) {
            return new Response(JSON.stringify({ error: "'settings' must be a valid object" }), { status: 400 });
        }

        const client = await clientPromise;
        const usersCollection = client.db("class-scheduling-app").collection<UserType>("users");

        const result = await usersCollection.updateOne({ email: userEmail }, { $set: { settings } }, { upsert: true });

        if (result.matchedCount === 0 && result.upsertedCount === 0) {
            // Should not happen: means neither matched nor inserted
            return new Response(JSON.stringify({ error: "Failed to create or update settings" }), { status: 500 });
        }

        return new Response(JSON.stringify({ message: "Settings saved successfully", success: true }), { status: 200 });
    } catch (error) {
        console.error("Error in PUT /api/settings:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
