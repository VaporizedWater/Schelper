"use server";

import clientPromise from "@/lib/mongodb";
import { UserType } from "@/lib/types";
import { Collection, Document, ObjectId } from "mongodb";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("cohorts") as Collection<Document>;

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
                    from: "cohorts",
                    localField: "current_cohort",
                    foreignField: "_id",
                    as: "cohortDetails",
                },
            },
            {
                $project: {
                    _id: "$current_cohort",
                    freshman: "$cohortDetails.freshman",
                    sophomore: "$cohortDetails.sophomore",
                    junior: "$cohortDetails.junior",
                    senior: "$cohortDetails.senior",
                },
            },
        ];

        const data = await collection.aggregate(pipeline).toArray();

        if (!data.length) {
            return new Response(JSON.stringify({ error: "No cohorts found" }), { status: 404 });
        }

        return new Response(JSON.stringify(data[0]), { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/cohorts:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // Parse the request body
        const { userEmail, cohortData } = await request.json();

        if (!userEmail || !cohortData) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // Start a session and transaction for atomicity
        const session = client.startSession();
        let newCohortId;

        try {
            session.startTransaction();

            // Step 1: Insert the new cohort document
            const cohortsCollection = client.db("class-scheduling-app").collection("cohorts");
            const cohortResult = await cohortsCollection.insertOne(cohortData, { session });
            newCohortId = cohortResult.insertedId;

            // Step 2: Update the user document to include the new cohort ID and set as current
            const usersCollection = client.db("class-scheduling-app").collection<UserType>("users");
            const updateResult = await usersCollection.findOneAndUpdate(
                { email: userEmail },
                {
                    $push: { cohorts: newCohortId.toString() },
                    $set: { current_cohort: newCohortId.toString() },
                },
                { session, returnDocument: "after" }
            );

            if (!updateResult) {
                // User not found, abort transaction
                await session.abortTransaction();
                return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
            }

            // Commit the transaction
            await session.commitTransaction();

            return new Response(
                JSON.stringify({
                    cohortId: newCohortId,
                    message: "Cohort created and user updated successfully",
                    success: true,
                }),
                { status: 201 }
            );
        } catch (error) {
            // Any error will abort the transaction
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    } catch (error) {
        console.error("Error in POST /api/cohorts:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { cohortId: string } }) {
    try {
        const cohortId = params.cohortId;
        const cohortData = await request.json();

        if (!cohortId || !cohortData) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        const result = await collection.updateOne({ _id: new ObjectId(cohortId) }, { $set: cohortData });

        if (result.modifiedCount === 0) {
            return new Response(JSON.stringify({ error: "Cohort not found or no changes made" }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: "Cohort updated successfully", success: true }), { status: 200 });
    } catch (error) {
        console.error("Error in PUT /api/cohorts:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
