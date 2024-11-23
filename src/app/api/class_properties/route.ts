import clientPromise from "@/lib/mongodb";
import { Document, ObjectId } from "mongodb";
import { ClassProperty } from "../types";

export async function GET(request: Request) {
  const client = await clientPromise;
  const classTable = client.db("class-scheduling-app").collection("class_properties");
  const classID = request.headers.get("id") + "";

  let response: Response, data;

  if (classID.length) {
    const objID = new ObjectId(classID);
    data = await classTable.findOne({ associated_class: objID });

    if (data) {
      const dataDoc: Document = data;
      const classProperties: ClassProperty = {
        object_id: dataDoc._id,
        associated_class: dataDoc.associated_class,
        class_status: dataDoc.class_status,
        start_time: dataDoc.start_time,
        end_time: dataDoc.end_time,
        room: dataDoc.room,
        facility_id: dataDoc.facility_id,
        days: dataDoc.days,
        start_date: dataDoc.start_date,
        end_date: dataDoc.end_date,
        instructor_email: dataDoc.instructor_email,
        total_enrolled: dataDoc.total_enrolled,
        total_waitlisted: dataDoc.total_waitlisted
      };
      response = new Response(JSON.stringify(classProperties), { status: 200 });
    } else {
      response = new Response(null, { status: 200 });
    }
  } else {
    response = new Response(null, { status: 200 });
  }

  return response;
}
