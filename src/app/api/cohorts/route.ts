"use server";

import clientPromise from "@/lib/mongodb";
import { UserType } from "@/lib/types";
// import { Collection, Document, ObjectId } from "mongodb";
import { Document } from "mongodb";

const client = await clientPromise;
// const collection = client.db("class-scheduling-app").collection("cohorts") as Collection<Document>;

export async function GET(request: Request) {
    const collection = client.db("class-scheduling-app").collection("users");

    try {
        const userEmail = request.headers.get("userEmail");

        if (request.headers.get("loadAll") === null) {
            return new Response(JSON.stringify("Header: 'loadAll' is missing"), { status: 400 });
        }

        const loadAll: boolean = request.headers.get("loadAll") === "true";

        if (!userEmail || userEmail.split("@").length !== 2) {
            return new Response(JSON.stringify("Header: 'userEmail' is missing or invalid"), { status: 400 });
        }

        let pipeline: Document[] = [];
        console.log("loadAll", loadAll);
        if (loadAll) {
            pipeline = [
                {
                    $match: {
                        email: userEmail,
                    },
                },
                {
                    $lookup: {
                        from: "cohorts",
                        localField: "cohorts",
                        foreignField: "_id",
                        as: "cohortsDetails",
                    },
                },
                {
                    $unwind: "$cohortsDetails", // Flatten the array
                },
                {
                    $replaceRoot: { newRoot: "$cohortsDetails" }, // Promote cohort to top level
                },
            ];
        } else {
            pipeline = [
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
                    $unwind: "$cohortDetails", // Unwind the array before projecting
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
        }

        const data = await collection.aggregate(pipeline).toArray();

        if (!data.length) {
            return new Response(JSON.stringify({ error: "No cohorts found" }), { status: 404 });
        }

        return new Response(JSON.stringify(data), { status: 200 });
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
                    $push: { cohorts: newCohortId },
                    $set: { current_cohort: newCohortId },
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

// export async function PUT(request: Request, { params }: { params: { cohortId: string } }) {
//     try {
//         const cohortId = params.cohortId;
//         const cohortData = await request.json();

//         if (!cohortId || !cohortData) {
//             return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
//         }

//         const result = await collection.updateOne({ _id: new ObjectId(cohortId) }, { $set: cohortData });

//         if (result.modifiedCount === 0) {
//             return new Response(JSON.stringify({ error: "Cohort not found or no changes made" }), { status: 404 });
//         }

//         return new Response(JSON.stringify({ message: "Cohort updated successfully", success: true }), { status: 200 });
//     } catch (error) {
//         console.error("Error in PUT /api/cohorts:", error);
//         return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
//     }
// }
