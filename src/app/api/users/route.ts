import clientPromise from "@/lib/mongodb";
import { Document } from "mongodb";

export async function GET(request: Request) {
    const client = await clientPromise;
    const userTable = client.db("class-scheduling-app").collection("users");

    const authID = request.headers.get("authentication_hash") + "";

    let response: Response, data;

    if (authID.length) {
        data = await userTable.findOne({ authentication_hash: authID });

        if (data) {
            const dataDoc: Document = data;
            const userProperties = {
                faculty_id: dataDoc.faculty_id,
                name: dataDoc.name,
                email: dataDoc.email,
                classes: dataDoc.classes,
            };
            response = new Response(JSON.stringify(userProperties), { status: 200 });
        } else {
            response = new Response(null, { status: 200 });
        }
    } else {
        response = new Response(null, { status: 200 });
    }

    return response;
}
