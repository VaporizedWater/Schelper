import clientPromise from "@/lib/mongodb";
import { Document, ObjectId } from "mongodb";
import { ClassProperty } from "@/lib/types";
import { documentToClassProperty } from "@/lib/common";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("class_properties");

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
                const classProperty: ClassProperty = documentToClassProperty(data as Document);
                return Response.json(classProperty);
            } else {
                return Response.json(null, { status: 200 });
            }
        }

        // No ID provided - return all classes
        const data = await collection.find({}).toArray();

        if (!data || !Array.isArray(data)) {
            return Response.json({ error: "No classes found" }, { status: 404 });
        }

        const properties: ClassProperty[] = data.map((doc: Document) => documentToClassProperty(doc));
        return Response.json(properties);
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
