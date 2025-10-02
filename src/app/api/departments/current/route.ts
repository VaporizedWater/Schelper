import clientPromise from "@/lib/mongodb";
import { requireEmail } from "@/lib/requireEmail";
import { UserType } from "@/lib/types";

export async function PUT(request: Request) {
    try {
        const userEmail = await requireEmail();

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
        if (error instanceof Response) return error; // Propagate Response errors directly

        console.error("Error in PUT /api/departments:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
