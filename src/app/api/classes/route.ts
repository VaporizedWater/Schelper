"use server";

import clientPromise from "@/lib/mongodb";
import { Document, ObjectId } from "mongodb";
import { Class } from "../../../lib/types";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("classes");

export async function GET(request: Request) {
    const headerId = request.headers.get("id");
    const classID = headerId ? headerId : "";
    console.log("classID: " + classID);

    let response: Response, data;

    if (classID.length) {
        console.log("We not there!");
        if (!ObjectId.isValid(classID)) {
            return Response.json({ error: "Invalid class ID" }, { status: 400 });
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
            response = new Response(JSON.stringify(classData), { status: 200 });
        } else {
            response = new Response(null, { status: 200 });
        }
    } else {
        // No ID provided - return all classes
        console.log("WE HERE!!!");
        data = await collection.find({}).toArray();

        if (data) {
            console.log("MADE IT");
            console.log(JSON.stringify(data));
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

            response = new Response(JSON.stringify(classData), { status: 200 });
        } else {
            console.log("NOPE!");
            response = new Response(null, { status: 200 });
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
            _id: body._id && ObjectId.isValid(body._id) ? new ObjectId(body._id) : new ObjectId(),
        };

        const result = await collection.insertOne(document);

        return new Response(JSON.stringify({ insertedId: result.insertedId }), { status: 201 });
    } catch (error) {
        return new Response(`Error inserting class into classes: ${error}`, { status: 500 });
    }
}
