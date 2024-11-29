import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
    const client = await clientPromise;
    const classTable = client.db("class-scheduling-app").collection("tags");

    let response: Response;

    const data = await classTable.find();

    if (data) {
        const tagItems = await data.toArray();
        response = new Response(JSON.stringify(tagItems), { status: 200 });
    } else {
        response = new Response(null, { status: 200 });
    }

    return response;
}
