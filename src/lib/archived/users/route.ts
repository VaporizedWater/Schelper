// import clientPromise from "@/lib/mongodb";
// import { Document } from "mongodb";

// const client = await clientPromise;
// const collection = client.db("class-scheduling-app").collection("users");

// // export async function GET(request: Request) {

// //     const authID = request.headers.get("authentication_hash") + "";

// //     let response: Response, data;

// //     if (authID.length) {
// //         data = await collection.findOne({ authentication_hash: authID });

// //         if (data) {
// //             const dataDoc: Document = data;
// //             const userProperties = {
// //                 faculty_id: dataDoc.faculty_id,
// //                 name: dataDoc.name,
// //                 email: dataDoc.email,
// //                 classes: dataDoc.classes,
// //             };
// //             response = new Response(JSON.stringify(userProperties), { status: 200 });
// //         } else {
// //             response = new Response(null, { status: 200 });
// //         }
// //     } else {
// //         response = new Response(null, { status: 200 });
// //     }

// //     return response;
// // }
