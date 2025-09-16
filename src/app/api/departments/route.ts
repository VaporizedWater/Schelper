import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { DepartmentType, UserType } from "@/lib/types";
import { Collection, ObjectId } from "mongodb";

export async function GET() {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const userEmail = session.user.email;

        if (!userEmail || userEmail.split("@").length !== 2) {
            return new Response(JSON.stringify({ error: "Missing or invalid user email" }), { status: 400 });
        }

        const client = await clientPromise;
        const usersCollection = client.db("class-scheduling-app").collection<UserType>("users");

        const user = await usersCollection.findOne(
            { email: userEmail },
            { projection: { _id: 0, departments: 1, current_department_id: 1 } }
        );

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        // If no departments yet, return empty array
        const departments = user.departments || [];
        const current_department_id = user.current_department_id || null;
        return new Response(JSON.stringify({ departments: { all: departments, current: current_department_id } }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error in GET /api/departments:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const userEmail = session.user.email;
        const { departmentData } = await request.json();

        if (!userEmail || userEmail.split("@").length !== 2) {
            return new Response(JSON.stringify({ error: "Missing or invalid user email" }), { status: 400 });
        }
        if (!departmentData || Object.keys(departmentData).length === 0) {
            return new Response(JSON.stringify({ error: "No department data provided" }), { status: 400 });
        }
        if (!departmentData.name) {
            return new Response(JSON.stringify({ error: "Department name is required" }), { status: 400 });
        }
        if (!Array.isArray(departmentData.faculty_list)) {
            return new Response(JSON.stringify({ error: "faculty_list must be an array" }), { status: 400 });
        }

        const client = await clientPromise;
        const usersCollection = client.db("class-scheduling-app").collection<UserType>("users");
        const user = await usersCollection.findOne({ email: userEmail });

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }
        const departmentDataWithDefaults: DepartmentType = {
            ...departmentData,
            _id: new ObjectId(),
            cohorts: departmentData.cohorts || [],
            current_cohort: departmentData.current_cohort || null,
            class_list: departmentData.class_list || [],
        };
        if (!departmentDataWithDefaults._id) {
            return new Response(JSON.stringify({ error: "Failed to generate department ID" }), { status: 500 });
        }

        const updateResult = await usersCollection.updateOne(
            { email: userEmail },
            {
                $push: { departments: departmentDataWithDefaults },
                $set: { current_department_id: departmentDataWithDefaults._id },
            }
        );

        if (updateResult.modifiedCount === 0) {
            return new Response(JSON.stringify({ error: "Failed to add department" }), { status: 500 });
        }

        return new Response(
            JSON.stringify({
                success: true,
                departmentId: departmentDataWithDefaults._id.toString(),
                message: "Department added successfully",
            }),
            { status: 201 }
        );
    } catch (error) {
        console.error("Error in POST /api/departments:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }
        const userEmail = session.user.email;
        if (!userEmail || userEmail.split("@").length !== 2) {
            return new Response(JSON.stringify({ error: "Missing or invalid user email" }), { status: 400 });
        }

        const { departmentId } = await request.json();
        if (!departmentId) {
            return new Response(JSON.stringify({ error: "No department ID provided" }), { status: 400 });
        }
        const client = await clientPromise;
        const usersCollection = client.db("class-scheduling-app").collection<UserType>("users");
        const user = await usersCollection.findOne({ email: userEmail });

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const departmentExists = user.departments?.some((dept) => dept._id?.toString() === departmentId);
        
        if (!departmentExists) {
            return new Response(JSON.stringify({ error: "Department not found" }), { status: 404 });
        }

        // Update current_department_id to the selected department if it isn't already set
        if (user.current_department_id?.toString() === departmentId) {
            return new Response(
                JSON.stringify({ success: true, message: "Current department is already set to the selected department" }),
                { status: 200 }
            );
        }    

        const updateResult = await usersCollection.updateOne(
            { email: userEmail },
            {
                $set: {
                    current_department_id:
                        user.departments?.find((dept) => dept._id?.toString() === departmentId)?._id || undefined,
                },
            }
        );

        if (updateResult.modifiedCount === 0) {
            return new Response(JSON.stringify({ error: "Failed to set current department" }), { status: 500 });
        }
        return new Response(JSON.stringify({ success: true, message: "Current department updated successfully" }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error in PUT /api/departments:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

export async function DELETE(request: Request): Promise<Response> {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const { departmentId } = await request.json();
        if (typeof departmentId !== "string" || !departmentId.trim()) {
            return new Response(JSON.stringify({ error: "Invalid department ID" }), { status: 400 });
        }

        const userEmail = session.user.email;
        const client = await clientPromise;
        const usersCollection = client.db("class-scheduling-app").collection("users") as Collection<Document>;

        // 1) Verify user & presence of the target department (for clean 404s)
        const user = (await usersCollection.findOne({ email: userEmail })) as
            | (Document & { departments?: any[]; current_department_id?: any }) // eslint-disable-line @typescript-eslint/no-explicit-any
            | null;

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const departments = Array.isArray(user?.departments) ? user.departments : [];
        const departmentExists = departments.some((d) => String(d?._id) === departmentId);
        if (!departmentExists) {
            return new Response(JSON.stringify({ error: "Department not found" }), { status: 404 });
        }

        // 2) Pipeline update:
        //    - Build filtered array without the deleted department
        //    - If we just deleted the current one:
        //        * set next current_department_id to the first remaining department if any
        //        * else null
        //      Otherwise, keep current_department_id as-is.
        const updateResult = await usersCollection.updateOne(
            { email: userEmail },
            [
                {
                    $set: {
                        _tmpDepartments: {
                            $filter: {
                                input: { $ifNull: ["$departments", []] },
                                as: "d",
                                cond: { $ne: [{ $toString: "$$d._id" }, departmentId] },
                            },
                        },
                    },
                },
                {
                    $set: {
                        departments: "$_tmpDepartments",
                        current_department_id: {
                            $cond: [
                                // Is the currently selected department the one we're deleting?
                                { $eq: [{ $toString: { $ifNull: ["$current_department_id", ""] } }, departmentId] },
                                // Yes → choose the next one if available; else null
                                {
                                    $cond: [
                                        { $gt: [{ $size: "$_tmpDepartments" }, 0] },
                                        {
                                            $let: {
                                                vars: { first: { $arrayElemAt: ["$_tmpDepartments", 0] } },
                                                in: "$$first._id", // ← only the id
                                            },
                                        },
                                        null,
                                    ],
                                },
                                // No → keep existing current_department_id. Normalize if it was an object.
                                {
                                    $cond: [
                                        { $eq: [{ $type: "$current_department_id" }, "object"] },
                                        "$current_department_id._id",
                                        "$current_department_id",
                                    ],
                                },
                            ],
                        },
                    },
                },
                { $unset: "_tmpDepartments" },
            ] as any // eslint-disable-line @typescript-eslint/no-explicit-any
        );

        if (updateResult.modifiedCount === 0) {
            return new Response(JSON.stringify({ error: "Failed to delete department" }), { status: 500 });
        }

        return new Response(JSON.stringify({ success: true, message: "Department deleted successfully" }), { status: 200 });
    } catch (error) {
        console.error("Error in DELETE /api/departments:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
