import clientPromise from "@/lib/mongodb";
import { Document, ObjectId } from "mongodb";
import { Class } from "../../../lib/types";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("classes");

export async function GET(request: Request) {

    const classID = request.headers.get("id") + "";

    let response: Response, data;

    if (classID.length) {
        const objID = new ObjectId(classID);
        data = await collection.findOne({ _id: objID });

        if (data) {
            const dataDoc: Document = data;
            const classProperties: Class = {
                object_id: dataDoc._id,
                associated_properties: dataDoc.associated_properties,
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
            response = new Response(JSON.stringify(classProperties), { status: 200 });
        } else {
            response = new Response(null, { status: 200 });
        }
    } else {
        response = new Response(null, { status: 200 });
    }

    return response;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = await collection.insertOne(body);

        return new Response(JSON.stringify({ insertedId: result.insertedId }), { status: 201 });
    } catch (error) {
        return new Response(`Error inserting class into classes: ${error}`, { status: 500 });
    }
}
