import clientPromise from "@/lib/mongodb";
import { Document, ObjectId } from "mongodb";
import { Class } from "../../../lib/types";

export async function GET(request: Request) {
    const client = await clientPromise;
    const classTable = client.db("class-scheduling-app").collection("classes");
    const classID = request.headers.get("id") + "";

    let response: Response, data;

    if (classID.length) {
        const objID = new ObjectId(classID);
        data = await classTable.findOne({ _id: objID });

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
