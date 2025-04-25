// import clientPromise from "@/lib/mongodb";
// import { Collection, ObjectId } from "mongodb";

// const client = await clientPromise;
// const collection = client.db("class-scheduling-app").collection("users") as Collection<Document>;

// export async function GET(request: Request): Promise<Response> {
//     try {
//         const { userEmail } = (await request.json()) as { userEmail: string };

//         const pipeline = [
//             {
//                 $match: {
//                     email: userEmail,
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "calendars",
//                     localField: "current_calendar",
//                     foreignField: "_id",
//                     as: "calendarDetails",
//                 },
//             },
//             {
//                 $unwind: "$calendarDetails",
//             },
//             {
//                 $lookup: {
//                     from: "combined_classes",
//                     localField: "calendarDetails.classes",
//                     foreignField: "_id",
//                     as: "classDetails",
//                 },
//             },
//             {
//                 $project: {
//                     _id: "$current_calendar",
//                     info: {
//                         _id: { $toString: "$calendarDetails.info._id" },
//                         semester: "$calendarDetails.info.semester",
//                         year: "$calendarDetails.info.year",
//                         name: "$calendarDetails.info.name",
//                     },
//                     classes: {
//                         $map: {
//                             input: "$classDetails",
//                             as: "class",
//                             in: {
//                                 _id: { $toString: "$$class._id" },
//                                 data: "$$class.data",
//                                 properties: "$$class.properties",
//                                 visible: false,
//                             },
//                         },
//                     },
//                 },
//             },
//         ];

//         const data = await collection.aggregate(pipeline).toArray();

//         console.log(data);

//         if (!data.length) {
//             return new Response(JSON.stringify({ error: "No classes found" }), { status: 404 });
//         }

//         return new Response(JSON.stringify(data[0]), { status: 200 });
//     } catch (error) {
//         console.error("Error in PUT /api/combined_classes:", error);
//         return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
//             status: 500,
//             headers: { "Content-Type": "application/json" },
//         });
//     }
// }

// export async function PUT(request: Request): Promise<Response> {
//     try {
//         const { userId, calendarId } = (await request.json()) as { userId: string, calendarId: string; };

//         if (ObjectId.isValid(calendarId) && ObjectId.isValid(userId)) {
//             const calendar = new ObjectId(calendarId);

//             await collection.findOneAndUpdate(
//                 { _id: new ObjectId(userId) },
//                 { $addToSet: { classes: { calendar } } },
//                 { upsert: true }
//             );
//         }

//         return new Response(
//             JSON.stringify({ success: true }),
//             {
//                 status: 200,
//                 headers: { "Content-Type": "application/json" },
//             }
//         );
//     } catch (error) {
//         console.error("Error in PUT /api/combined_classes:", error);
//         return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
//             status: 500,
//             headers: { "Content-Type": "application/json" },
//         });
//     }
// }



export async function GET(request: Request): Promise<Response> {
    console.warn("Request: ",request);
    throw new Error("Not Implemented");
}

export async function PUT(request: Request): Promise<Response> {
    console.warn("Request: ",request);
    throw new Error("Not Implemented");
}
