"use server";

import clientPromise from "@/lib/mongodb";
import { Document, ObjectId } from "mongodb";
import { Class } from "../../../lib/types";
import { documentToClass } from "@/lib/common";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("classes");

/**
 * GET handler for class data
 * - With ID: Returns single class
 * - Without ID: Returns all classes
 */
export async function GET(request: Request) {
    try {
        const headerId = request.headers.get("id");
        const classID = headerId ? headerId : "";

        if (classID.length) {
            if (!ObjectId.isValid(classID)) {
                return Response.json({ error: "Invalid class ID" }, { status: 400 });
            }

            const objID = new ObjectId(classID);
            const data = await collection.findOne({ _id: objID });

            if (data) {
                const classData: Class = documentToClass(data as Document);
                return Response.json(classData, { status: 200 });
            } else {
                return Response.json(null, { status: 200 });
            }
        }

        // No ID provided - return all classes
        const data = await collection.find({}).toArray();

        if (!data || !Array.isArray(data)) {
            return Response.json({ error: "No classes found" }, { status: 404 });
        }

        const classData: Class[] = data.map((doc: Document) => documentToClass(doc));

        return Response.json(classData);
    } catch (error) {
        console.error("Error in GET /api/classes:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * POST handler to create a new class
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Convert _id to an ObjectId if it's provided and valid
        const document = {
            ...body,
            _id: body._id && ObjectId.isValid(String(body._id)) ? new ObjectId(String(body._id)) : new ObjectId(),
        };

        const result = await collection.insertOne(document);

        return Response.json({ insertedId: result.insertedId }, { status: 201 });
    } catch (error) {
        return Response.json({ error: `Error inserting class into classes: ${error}` }, { status: 500 });
    }
}

/**
 * PUT handler to update an existing class
 * - Updates by ID if provided and valid
 * - Otherwise updates/creates by class identifiers
 */
export async function PUT(request: Request) {
    try {
        const body = await request.json();

        if (body._id === undefined || body.id === null) {
            console.log("Received blank or invalid _id in class update:", body._id);
            return Response.json({ error: "Invalid class ID" }, { status: 400 });
        } else {
            console.log("Valid class ID" + body._id);
        }

        const { _id, ...updateData } = body;
        const { catalog_num, class_num, session, course_subject, course_num } = body;

        let id;
        let result;

        if (!ObjectId.isValid(body._id) || body._id === "") {
            const document = await collection.findOne({
                catalog_num: catalog_num,
                class_num: class_num,
                session: session,
                course_subject: course_subject,
                course_num: course_num,
            });
            if (document) {
                const objID = new ObjectId(document._id);
                result = await collection.updateOne({ _id: objID }, { $set: updateData });
                id = document._id?.toString();
            } else {
                result = await collection.updateOne(
                    {
                        catalog_num: catalog_num,
                        class_num: class_num,
                        session: session,
                        course_subject: course_subject,
                        course_num: course_num,
                    },
                    { $set: updateData },
                    { upsert: true }
                );
                id = result.upsertedId?.toString();
            }
        } else {
            const objID = new ObjectId(String(_id));
            result = await collection.updateOne({ _id: objID }, { $set: updateData });
            id = _id;
        }

        return Response.json({ modifiedCount: result.modifiedCount, _id: id }, { status: 200 });
    } catch (error) {
        return Response.json({ error: `Error updating class in classes: ${error}` }, { status: 500 });
    }
}
