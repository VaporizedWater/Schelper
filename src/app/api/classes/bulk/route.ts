"use server";

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
    try {
        const classesData = await request.json();

        if (!Array.isArray(classesData) || classesData.length === 0) {
            return Response.json({ error: "Invalid request: classes array is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const collection = client.db("class-scheduling-app").collection("classes");

        const insertedIds: { [key: string]: string } = {};
        const operations = [];

        // Prepare operations for each class
        for (let i = 0; i < classesData.length; i++) {
            const classData = { ...classesData[i] };

            // Generate a new ID for classes without one
            if (!classData._id) {
                const newId = new ObjectId().toString();
                classData._id = newId;
                insertedIds[i] = newId;
            }

            // For MongoDB, convert string ID to ObjectId
            const mongoId = new ObjectId(classData._id);
            classData._id = mongoId;

            operations.push({
                insertOne: { document: classData },
            });
        }

        // Execute bulk operation
        const result = await collection.bulkWrite(operations);

        return Response.json({
            success: true,
            insertedIds,
            insertedCount: result.insertedCount,
        });
    } catch (error) {
        console.error("Bulk class insert error:", error);
        return Response.json({ error: "Failed to insert classes" }, { status: 500 });
    }
}
