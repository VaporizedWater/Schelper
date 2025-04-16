"use server";

import clientPromise from "@/lib/mongodb";
import { Collection, Document, ObjectId } from "mongodb";
import { FacultyType } from "@/lib/types";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("faculty") as Collection<Document>;

export async function GET() {
    try {
        const faculty = await collection.find({}).toArray();
        return new Response(JSON.stringify(faculty), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error in GET /api/faculty:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function PUT(request: Request) {
    try {
        const facultyData: FacultyType[] = await request.json();

        const bulkOps = facultyData.map((faculty) => {
            const { _id, ...facultyDataToInsert } = faculty; // eslint-disable-line @typescript-eslint/no-unused-vars
            return {
                updateOne: {
                    filter: { _id: new ObjectId(_id) },
                    update: { $set: facultyDataToInsert },
                    upsert: true,
                },
            };
        });

        const result = await collection.bulkWrite(bulkOps);
        
        if (result.ok) {
            return new Response(
                JSON.stringify({ success: true }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
        return new Response(
            JSON.stringify({ success: false }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );

    } catch (error) {
        console.error("Error in POST /api/faculty:", error);
        return new Response(
            JSON.stringify({ success: false, error: "Internal server error" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}

