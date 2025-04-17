"use server";

import clientPromise from "@/lib/mongodb";
import { Collection, Document } from "mongodb";
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

export async function POST(request: Request) {
    try {
        const facultyData: FacultyType = await request.json();
        const { _id, ...facultyDataToInsert } = facultyData; // eslint-disable-line @typescript-eslint/no-unused-vars

        const result = await collection.insertOne(facultyDataToInsert);

        if (result.acknowledged) {
            return new Response(JSON.stringify({ success: true, id: result.insertedId }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }
        return new Response(JSON.stringify({ success: false }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error in POST /api/faculty:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function PUT(request: Request) {
    try {
        const facultyData: FacultyType[] = await request.json();

        const bulkOps = facultyData.map((faculty) => {
            const { _id, email, ...facultyDataToInsert } = faculty; // eslint-disable-line @typescript-eslint/no-unused-vars
            return {
                updateOne: {
                    filter: { email: email },
                    update: { $set: facultyDataToInsert },
                    upsert: true,
                },
            };
        });

        const result = await collection.bulkWrite(bulkOps);

        if (result.ok) {
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }
        return new Response(JSON.stringify({ success: false }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error in POST /api/faculty:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function DELETE(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return new Response(JSON.stringify({ success: false, error: "Email is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const result = await collection.deleteOne({ email });

        if (result.deletedCount === 1) {
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } else if (result.deletedCount === 0) {
            return new Response(JSON.stringify({ success: false, error: "Faculty not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ success: false }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error in DELETE /api/faculty:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
