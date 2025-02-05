import clientPromise from "@/lib/mongodb";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("tags");

export async function GET(request: Request) {
    let response: Response;
    
    if (request.body) {
        console.log(request.body);
    }

    const data = await collection.find();

    if (data) {
        const tagItems = await data.toArray();
        response = new Response(JSON.stringify(tagItems), { status: 200 });
    } else {
        response = new Response(null, { status: 200 });
    }

    return response;
}

export async function POST(request: Request) {
    try {
        const body = await request.json(); 
        const { tagName } = body; 

        if (!tagName) {
            return new Response("Tag name is required", { status: 400 });
        }

        const newTag = { tagName, classes: [] }; 
        await collection.insertOne(newTag); 

        return new Response("Tag added successfully", { status: 201 });
    } catch (error) {
        console.error("Error adding tag:", error);
        return new Response("Failed to add tag", { status: 500 });
    }
}