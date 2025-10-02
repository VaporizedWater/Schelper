"use server";

import clientPromise from "@/lib/mongodb";
import { requireEmail } from "@/lib/requireEmail";
import { UserType } from "@/lib/types";

export async function POST(request: Request) {
    try {
        const userEmail = await requireEmail();

        const userData = await request.json();

        if (!userData || Object.keys(userData).length === 0) {
            return new Response(JSON.stringify({ error: "No user data provided" }), { status: 400 });
        }

        // userData has no email so add it from the authenticated session
        userData.email = userEmail;

        const client = await clientPromise;
        const usersCollection = client.db("class-scheduling-app").collection<UserType>("users");
        const existingUser = await usersCollection.findOne({ email: userEmail });

        if (existingUser) {
            return new Response(JSON.stringify({ error: "User already exists" }), { status: 409 });
        }

        const result = await usersCollection.insertOne(userData);
        return new Response(
            JSON.stringify({ message: "User created successfully", success: true, userId: result.insertedId }),
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof Response) return error; // Propagate Response errors directly

        console.error("Error in POST /api/users:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
