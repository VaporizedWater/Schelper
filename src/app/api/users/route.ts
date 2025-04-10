"use server";

import clientPromise from "@/lib/mongodb";

const client = await clientPromise;
const collection = client.db("class-scheduling-app").collection("users");

export async function GET(request: Request) {
    const email = request.headers.get("email");

    if (email && email !== "") {
        console.log("VALID EMAIL!", email);
        const calendar = await collection.findOne({ email: email });

        if (calendar) {
            console.log("USER FOUND!", calendar);
        } else {
            console.log("USER NOT FOUND!");
        }

        if (!calendar) {
            return new Response(JSON.stringify({ success: false, message: "User not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ success: true, calendar }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ success: false, message: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
    });
}
