import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
    const client = await clientPromise;
    const classTable = client.db("class-scheduling-app").collection("tags");

    let response: Response;
    
    if (request.body) {
        console.log(request.body);
    }

    const data = await classTable.find();

    if (data) {
        const tagItems = await data.toArray();
        response = new Response(JSON.stringify(tagItems), { status: 200 });
    } else {
        response = new Response(null, { status: 200 });
    }

    return response;
}

export async function POST(request: Request) {
    const client = await clientPromise;
    const classTable = client.db("class-scheduling-app").collection("tags");

    try {
        const body = await request.json(); 
        const { tagName } = body; 

        if (!tagName) {
            return new Response("Tag name is required", { status: 400 });
        }

        const newTag = { tagName, classes: [] }; 
        await classTable.insertOne(newTag); 

        return new Response("Tag added successfully", { status: 201 });
    } catch (error) {
        console.error("Error adding tag:", error);
        return new Response("Failed to add tag", { status: 500 });
    }
}
