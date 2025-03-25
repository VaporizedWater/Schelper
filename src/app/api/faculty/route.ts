"use server";

import clientPromise from "@/lib/mongodb";
import { Collection, Document } from "mongodb";
import { Faculty } from "@/lib/types";

const client = await clientPromise;

export async function GET() {
    try {
        const collection = client.db("class-scheduling-app").collection("faculty") as Collection<Document>;

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
        const facultyData: Faculty = await request.json();
        const { _id, ...facultyDataToInsert } = facultyData; // eslint-disable-line @typescript-eslint/no-unused-vars

        const collection = client.db("class-scheduling-app").collection("faculty");

        const result = await collection.insertOne(facultyDataToInsert);
        return new Response(
            JSON.stringify({ success: true, insertedId: result.insertedId }),
            {
                status: 200,
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

