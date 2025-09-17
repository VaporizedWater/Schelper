"use server";

import clientPromise from "@/lib/mongodb";
import { requireEmail } from "@/lib/requireEmail";
import { UserType } from "@/lib/types";
import { Document, ObjectId } from "mongodb";

export async function GET(request: Request) {
    try {
        const userEmail = requireEmail();

        const departmentIdHeader = request.headers.get("departmentId");

        if (!departmentIdHeader) {
            return new Response(JSON.stringify("Header: 'departmentId' is missing"), { status: 400 });
        }

        if (!departmentIdHeader || !ObjectId.isValid(departmentIdHeader)) {
            return new Response(JSON.stringify("Header: 'departmentId' is missing or invalid"), { status: 400 });
        }

        const depObjectId = new ObjectId(departmentIdHeader);

        if (request.headers.get("loadAll") === null) {
            return new Response(JSON.stringify("Header: 'loadAll' is missing"), { status: 400 });
        }

        const loadAll: boolean = request.headers.get("loadAll") === "true";

        const client = await clientPromise;
        const collection = client.db("class-scheduling-app").collection("users");

        let pipeline: Document[] = [];
        if (loadAll) {
            pipeline = [
                { $match: { email: userEmail } },
                { $unwind: "$departments" }, // Unwind the departments array
                { $match: { "departments._id": depObjectId } },
                {
                    $lookup: {
                        from: "cohorts",
                        localField: "departments.cohorts",
                        foreignField: "_id",
                        as: "cohortsDetails",
                    },
                },
                { $unwind: "$cohortsDetails" }, // Flatten the array
                { $replaceRoot: { newRoot: "$cohortsDetails" } }, // Promote cohort to top level
            ];
        } else {
            pipeline = [
                { $match: { email: userEmail } },
                { $unwind: "$departments" }, // Unwind the departments array
                { $match: { "departments._id": depObjectId } },
                {
                    $lookup: {
                        from: "cohorts",
                        localField: "departments.current_cohort",
                        foreignField: "_id",
                        as: "cohortDetails",
                    },
                },
                { $unwind: "$cohortDetails" }, // Unwind the array before projecting
                {
                    $project: {
                        _id: "$departments.current_cohort",
                        cohortName: "$cohortDetails.cohortName",
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
        if (error instanceof Response) return error; // Propagate Response errors directly

        console.error("Error in GET /api/cohorts:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const userEmail = await requireEmail();

        const departmentIdHeader = request.headers.get("departmentId");
        if (!departmentIdHeader || !ObjectId.isValid(departmentIdHeader)) {
            return new Response(JSON.stringify("Header: 'departmentId' is missing or invalid"), { status: 400 });
        }
        const depObjectId = new ObjectId(departmentIdHeader);

        const { cohortData } = await request.json();
        if (!cohortData) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        const client = await clientPromise;

        // 1) Insert new cohort
        const cohortsCollection = client.db("class-scheduling-app").collection("cohorts");
        const cohortResult = await cohortsCollection.insertOne(cohortData);
        const newCohortId = cohortResult.insertedId;

        // 2) Update the target department and (only if null) set current_department_id
        const usersCollection = client.db("class-scheduling-app").collection<UserType>("users");

        const updateResult = await usersCollection.findOneAndUpdate(
            { email: userEmail },
            [
                {
                    $set: {
                        departments: {
                            $map: {
                                input: { $ifNull: ["$departments", []] },
                                as: "d",
                                in: {
                                    $cond: [
                                        { $eq: ["$$d._id", depObjectId] },
                                        {
                                            $mergeObjects: [
                                                "$$d",
                                                {
                                                    cohorts: {
                                                        $concatArrays: [{ $ifNull: ["$$d.cohorts", []] }, [newCohortId]],
                                                    },
                                                    current_cohort: newCohortId,
                                                },
                                            ],
                                        },
                                        "$$d",
                                    ],
                                },
                            },
                        },
                    },
                },
                // Set current_department_id to depObjectId only if it's not already set
                {
                    $set: {
                        current_department_id: { $ifNull: ["$current_department_id", depObjectId] },
                    },
                },
            ],
            { returnDocument: "after" }
        );

        if (!updateResult) {
            return new Response(JSON.stringify({ error: "User or department not found" }), { status: 404 });
        }

        return new Response(
            JSON.stringify({
                cohortId: newCohortId,
                message: "Cohort created and user updated successfully",
                success: true,
            }),
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof Response) return error; // Propagate Response errors directly

        console.error("Error in POST /api/cohorts:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await requireEmail();

        const departmentId = request.headers.get("departmentId");

        if (!departmentId) {
            return new Response(JSON.stringify("Header: 'departmentId' is missing"), { status: 400 });
        }

        const { cohortId, cohortData } = await request.json();

        if (!cohortId || !cohortData) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // Validate ObjectId format
        if (ObjectId.isValid(cohortId) === false) {
            console.error("Invalid ObjectId format:", cohortId);
            return new Response(JSON.stringify({ error: "Invalid cohort ID format. " + cohortId }), { status: 400 });
        }

        const client = await clientPromise;
        const cohortsCollection = client.db("class-scheduling-app").collection("cohorts");

        // Remove _id from cohortData before updating
        const { _id, ...cohortDataWithoutId } = cohortData; // eslint-disable-line @typescript-eslint/no-unused-vars

        console.log("ID", cohortData._id, "\n\n   ", cohortId);

        // First check if the document exists
        const result = await cohortsCollection.findOneAndUpdate(
            { _id: ObjectId.createFromHexString(cohortId) },
            { $set: cohortDataWithoutId }
        );

        if (!result || result.matchedCount === 0) {
            return new Response(JSON.stringify({ error: "Cohort not found" }), { status: 404 });
        }

        if (result.modifiedCount === 0) {
            return new Response(JSON.stringify({ message: "No changes were made to the cohort", success: true }), {
                status: 200,
            });
        }

        return new Response(JSON.stringify({ message: "Cohort updated successfully", success: true }), { status: 200 });
    } catch (error) {
        if (error instanceof Response) return error; // Propagate Response errors directly

        console.error("Error in PUT /api/cohorts:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const userEmail = await requireEmail();

        const departmentIdHeader = request.headers.get("departmentId");

        if (!departmentIdHeader) {
            return new Response(JSON.stringify("Header: 'departmentId' is missing"), { status: 400 });
        }

        if (!departmentIdHeader || !ObjectId.isValid(departmentIdHeader)) {
            return new Response(JSON.stringify("Header: 'departmentId' is missing or invalid"), { status: 400 });
        }
        const depObjectId = new ObjectId(departmentIdHeader);

        const { cohortId } = await request.json();

        console.log("userEmail", userEmail);

        if (!userEmail || userEmail.split("@").length !== 2) {
            return new Response(JSON.stringify("Header: 'userEmail' is missing or invalid"), { status: 400 });
        }

        if (!cohortId) {
            return new Response(JSON.stringify({ error: "Cohort ID is required" }), { status: 400 });
        }

        try {
            const client = await clientPromise;
            const cohortsCollection = client.db("class-scheduling-app").collection("cohorts");
            const usersCollection = client.db("class-scheduling-app").collection<UserType>("users");

            // Step 2: Update the user document to delete the cohort ID and remove from current
            const updateResult = await usersCollection.findOneAndUpdate(
                { email: userEmail, "departments._id": depObjectId },
                [
                    // Remove the cohort ID from the user's cohorts array
                    {
                        $set: {
                            "departments.$.cohorts": {
                                $filter: {
                                    input: "departments.$.cohorts",
                                    as: "cohort",
                                    cond: { $ne: ["$$cohort", new ObjectId(cohortId)] }, // Remove the cohort ID
                                },
                            },
                        },
                    },
                    {
                        $set: {
                            "departments.$.current_cohort": {
                                // set current cohort only if the current_cohort is the one being deleted
                                $cond: {
                                    if: { $eq: ["$departments.$.current_cohort", new ObjectId(cohortId)] },
                                    then: {
                                        $cond: {
                                            if: { $gt: [{ $size: "$departments.$.cohorts" }, 0] },
                                            then: { $arrayElemAt: ["$departments.$.cohorts", -1] }, // Set to the last cohort in the array
                                            else: null,
                                        },
                                    },
                                    else: "$departments.$.current_cohort",
                                },
                            },
                        },
                    },
                ],
                { returnDocument: "after" }
            );

            if (!updateResult) {
                return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
            }

            const result = await cohortsCollection.deleteOne({ _id: new ObjectId(cohortId) });

            if (result.deletedCount === 0) {
                return new Response(JSON.stringify({ error: "Cohort not found" }), { status: 404 });
            }

            return new Response(JSON.stringify({ message: "Cohort deleted successfully", success: true }), { status: 200 });
        } catch (error) {
            console.error("Transaction error in DELETE /api/cohorts:", error);
            return new Response(JSON.stringify({ error: "Internal server error during transaction" }), { status: 500 });
        }
    } catch (error) {
        if (error instanceof Response) return error; // Propagate Response errors directly

        console.error("Error in DELETE /api/cohorts:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
