"use server";

import clientPromise from "@/lib/mongodb";
import { Collection, Document, ObjectId } from "mongodb";
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
        return new Response(JSON.stringify({ success: true, insertedId: result.insertedId }), {
            status: 200,
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
        // Expecting a JSON body with facultyId and optionally day, start, and end
        const { facultyId, day, start, end } = await request.json();
        const collection = client.db("class-scheduling-app").collection("faculty");

        if (day && start && end) {
            // If day, start, and end are provided, remove that specific time slot from the faculty document
            const updateResult = await collection.updateOne(
                { _id: new ObjectId(facultyId) },
                { $pull: { [`unavailability.${day}`]: { start, end } } as any } // eslint-disable-line @typescript-eslint/no-explicit-any
            );
            return new Response(JSON.stringify({ success: true, updated: updateResult.modifiedCount }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } else if (facultyId) {
            // Otherwise, if only facultyId is provided, delete the entire faculty record
            const deleteResult = await collection.deleteOne({ _id: new ObjectId(facultyId) });
            return new Response(JSON.stringify({ success: true, deleted: deleteResult.deletedCount }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } else {
            return new Response(JSON.stringify({ success: false, error: "Missing facultyId" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
    } catch (error) {
        console.error("Error in DELETE /api/faculty:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
