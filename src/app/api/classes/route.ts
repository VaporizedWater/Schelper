"use server";

import clientPromise from "@/lib/mongodb";
import { Document, ObjectId } from "mongodb";
import { Class } from "../../../lib/types";
import { NextResponse } from "next/server";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("classes");

export async function GET(request: Request) {
    const headerId = request.headers.get("id");
    const classID = headerId ? headerId : "";

    let response: Response, data;

    if (classID.length) {
        if (!ObjectId.isValid(classID)) {
            return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
        }

        const objID = new ObjectId(classID);
        data = await collection.findOne({ _id: objID });

        if (data) {
            const dataDoc: Document = data;
            const classData: Class = {
                _id: dataDoc._id,
                catalog_num: dataDoc.catalog_num,
                class_num: dataDoc.class_num,
                session: dataDoc.session,
                course_subject: dataDoc.course_subject,
                course_num: dataDoc.course_num,
                section: dataDoc.section,
                title: dataDoc.title,
                location: dataDoc.location,
                enrollment_cap: dataDoc.enrollment_cap,
                waitlist_cap: dataDoc.waitlist_cap,
            };
            response = NextResponse.json(classData, { status: 200 });
        } else {
            response = NextResponse.json(null, { status: 200 });
        }
    } else {
        // No ID provided - return all classes
        data = await collection.find({}).toArray();

        if (data) {
            const classData: Class[] = data.map((doc: Document) => ({
                _id: doc._id,
                catalog_num: doc.catalog_num,
                class_num: doc.class_num,
                session: doc.session,
                course_subject: doc.course_subject,
                course_num: doc.course_num,
                section: doc.section,
                title: doc.title,
                location: doc.location,
                enrollment_cap: doc.enrollment_cap,
                waitlist_cap: doc.waitlist_cap,
            }));

            console.log("\n" + JSON.stringify(classData));

            response = NextResponse.json(classData, { status: 200 });
        } else {
            response = NextResponse.json(null, { status: 200 });
        }
    }

    return response;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Convert _id to an ObjectId if it's provided and valid
        const document = {
            ...body,
            _id: body._id && ObjectId.isValid(String(body._id)) ? new ObjectId(String(body._id)) : new ObjectId(),
        };

        const result = await collection.insertOne(document);

        return NextResponse.json({ insertedId: result.insertedId }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: `Error inserting class into classes: ${error}` }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();

        if (!body._id || !ObjectId.isValid(body._id)) {
            console.log("Received blank or invalid _id in class update:", body._id);
            return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
        } else {
            console.log("Valid class ID" + body._id);
        }

        const { _id, ...updateData } = body;

        const objID = new ObjectId(String(_id));
        const result = await collection.updateOne({ _id: objID }, { $set: updateData });

        return NextResponse.json({ modifiedCount: result.modifiedCount }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: `Error updating class in classes: ${error}` }, { status: 500 });
    }
}
