import clientPromise from "@/lib/mongodb";
import { Document, ObjectId } from "mongodb";
import fetchWithTimeout from "@/lib/utils";
import { ClassProperty } from "@/lib/types";
import { documentToClassProperty } from "@/lib/common";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("class_properties");

const fetchInstructorName = async (email: string): Promise<string> => {
    try {
        if (!email) return "";

        const emailID = email.substring(0, email.indexOf("@"));
        if (!emailID) return "";

        const response = await fetchWithTimeout(
            `https://search-service.k8s.psu.edu/search-service/resources/people?text=${emailID}&size=1`
        );

        if (!response.ok) return "";

        const userJSON = await response.json();
        return userJSON[0]?.displayName || "";
    } catch (error) {
        console.warn("Error fetching instructor name:", error);
        return "";
    }
};

export async function GET(request: Request) {
    try {
        const headerId = request.headers.get("id");
        const classID = headerId ? headerId : "";

        if (!classID.length || !ObjectId.isValid(classID)) {
            return Response.json({ error: "Invalid class ID" }, { status: 400 });
        }

        const objID = new ObjectId(classID);
        const data = await collection.findOne({ _id: objID });

        if (!data) {
            return Response.json(null, { status: 200 });
        }

        const classProperty: ClassProperty = documentToClassProperty(data as Document);

        if (classProperty.instructor_email) {
            classProperty.instructor_name = await fetchInstructorName(classProperty.instructor_email);
        }

        return Response.json(classProperty);
    } catch (error) {
        console.error("Error fetching class properties:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
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

        return Response.json({ insertedId: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error("Error creating class property:", error);
        return Response.json({ error: "Failed to create class property" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();

        if (!ObjectId.isValid(body._id)) {
            return Response.json({ error: "Invalid class ID" }, { status: 400 });
        }

        const { _id, ...updateData } = body;

        const objID = new ObjectId(String(_id));

        const result = await collection.updateOne({ _id: objID }, { $set: updateData }, { upsert: true });

        return Response.json({ modifiedCount: result.modifiedCount }, { status: 200 });
    } catch (error) {
        return Response.json({ error: `Error updating class in classes: ${error}` }, { status: 500 });
    }
}
