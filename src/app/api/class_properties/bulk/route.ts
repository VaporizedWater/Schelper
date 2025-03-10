"use server";

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
    try {
        const propertiesData = await request.json();

        if (!Array.isArray(propertiesData) || propertiesData.length === 0) {
            return Response.json({ error: "Invalid request: properties array is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const collection = client.db("class-scheduling-app").collection("class_properties");

        const operations = [];

        // Prepare operations for each class property
        for (const prop of propertiesData) {
            // Deep clone to avoid mutations
            const propCopy = JSON.parse(JSON.stringify(prop));

            if (!propCopy._id) {
                console.error("Missing _id in property:", propCopy);
                continue; // Skip items without ID instead of failing
            }

            try {
                // Convert string ID to ObjectId for MongoDB
                propCopy._id = new ObjectId(propCopy._id);

                operations.push({
                    insertOne: { document: propCopy },
                });
            } catch (err) {
                console.error(`Invalid ObjectId format for _id: ${propCopy._id}`, err);
                // Continue with other operations instead of failing completely
            }
        }

        // Skip bulk operation if no valid operations
        if (operations.length === 0) {
            console.warn("No valid class properties to insert");
            return Response.json({
                success: false,
                message: "No valid class properties to insert",
                insertedCount: 0,
            });
        }

        // Execute bulk operation
        const result = await collection.bulkWrite(operations);

        return Response.json({
            success: true,
            insertedCount: result.insertedCount,
        });
    } catch (error) {
        console.error("Bulk properties insert error:", error);
        return Response.json({ error: "Failed to insert class properties" }, { status: 500 });
    }
}
