import clientPromise from "@/lib/mongodb";
import { Document, ObjectId } from "mongodb";
import fetchWithTimeout from "@/lib/utils";
import { ClassProperty } from "@/lib/types";
import { NextResponse } from "next/server";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("class_properties");

const VisitedEmails = new Map<string, string>();

export async function GET(request: Request) {
    const headerId = request.headers.get("id");
    const classID = headerId ? headerId : "";

    if (!classID.length || !ObjectId.isValid(classID)) {
        return Response.json({ error: "Invalid class ID" }, { status: 400 });
    }

    const objID = new ObjectId(classID);
    const data = await collection.findOne({ _id: objID });

    if (data) {
        const dataDoc: Document = data;
        const email = dataDoc.instructor_email as string;
        let name = "";

        if (email.length) {
            const emailID = email.substring(0, email.search("@"));
            if (emailID) {
                const displayName = VisitedEmails.get(emailID);
                if (displayName) {
                    name = displayName;
                } else {
                    const response = await fetchWithTimeout(
                        "https://search-service.k8s.psu.edu/search-service/resources/people?text=" + emailID + "&size=1"
                    );
    
                    if (response.status == 200 && response.body) {
                        const responseText = new TextDecoder().decode((await response.body.getReader().read()).value);
                        const userJSON = JSON.parse(responseText);
                        name = userJSON[0].displayName;
                        VisitedEmails.set(emailID, name);
                    }
                }
            }
        }

        const classProperty: ClassProperty = {
            _id: dataDoc._id,
            class_status: dataDoc.class_status,
            start_time: dataDoc.start_time,
            end_time: dataDoc.end_time,
            room: dataDoc.room,
            facility_id: dataDoc.facility_id,
            days: dataDoc.days,
            instructor_email: email,
            instructor_name: name,
            total_enrolled: dataDoc.total_enrolled,
            total_waitlisted: dataDoc.total_waitlisted,
            tags: dataDoc.tags,
        };

        return Response.json(classProperty);
    }

    return new Response(null, { status: 200 });
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
        return new Response(`Error inserting class into properties: ${error}`, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();

        if (!ObjectId.isValid(body._id)) {
            return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
        }

        const { _id, ...updateData } = body;

        const objID = new ObjectId(String(_id));

        const result = await collection.updateOne({ _id: objID }, { $set: updateData }, { upsert: true });

        return NextResponse.json({ modifiedCount: result.modifiedCount }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: `Error updating class in classes: ${error}` }, { status: 500 });
    }
}

