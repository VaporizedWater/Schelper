"use server";

import clientPromise from "@/lib/mongodb";
import { UserType } from "@/lib/types";
import { ObjectId } from "mongodb";

export async function PUT(request: Request) {
    try {
        const { userEmail, updates } = await request.json();

        if (!userEmail) {
            return new Response(JSON.stringify({ error: "Missing user email" }), { status: 400 });
        }

        if (!updates || Object.keys(updates).length === 0) {
            return new Response(JSON.stringify({ error: "No updates provided" }), { status: 400 });
        }

        // Security check: prevent updating email
        if (updates.email) {
            return new Response(JSON.stringify({ error: "Email updating is not allowed" }), { status: 403 });
        }

        const client = await clientPromise;
        const usersCollection = client.db("class-scheduling-app").collection<UserType>("users");

        // Process updates to convert string IDs to ObjectIds where needed
        const processedUpdates = { ...updates };

        // Convert ObjectId strings to actual ObjectIds
        if (processedUpdates.current_cohort && typeof processedUpdates.current_cohort === "string") {
            try {
                processedUpdates.current_cohort = new ObjectId(processedUpdates.current_cohort);
            } catch (error) {
                return new Response(JSON.stringify({ error: "Invalid cohort ID format " + error }), { status: 400 });
            }

            // Verify the cohort exists in the user's cohorts list
            const userData = await usersCollection.findOne({ email: userEmail });
            if (!userData) {
                return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
            }

            const cohortExists = userData.cohorts.some(
                (cohortId) => cohortId.toString() === processedUpdates.current_cohort.toString()
            );

            if (!cohortExists) {
                return new Response(
                    JSON.stringify({ error: "Cannot set a cohort that is not in the user's cohorts list" }),
                    { status: 404 }
                );
            }
        }

        // Similar handling could be added for other ObjectId fields as needed

        // Update the user
        const result = await usersCollection.updateOne({ email: userEmail }, { $set: processedUpdates });

        if (result.matchedCount === 0) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        return new Response(
            JSON.stringify({
                message: "User updated successfully",
                success: true,
                modifiedCount: result.modifiedCount,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in PUT /api/users:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
