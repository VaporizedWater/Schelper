import clientPromise from "@/lib/mongodb";
import { Document, ObjectId } from "mongodb";
import { ClassProperty } from "../types";
import fetchWithTimeout from "../utils";

export async function GET(request: Request) {
    const client = await clientPromise;
    const classTable = client.db("class-scheduling-app").collection("class_properties");
    const classID = request.headers.get("id") + "";

    let response: Response, data;

    if (classID.length) {

        data = await classTable.findOne({ associated_class: classID });

        if (data) {
            const dataDoc: Document = data;
            const email = dataDoc.instructor_email;
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
                instructor_email: email,
                instructor_name: "test",
                total_enrolled: dataDoc.total_enrolled,
                total_waitlisted: dataDoc.total_waitlisted
            };
            
            // if (email.length) {
            //     console.log("Email "+email);
            //     let query = "https://search-service.k8s.psu.edu/search-service/resources/people?text=EMAIL_ID&size=1";
            //     let emailID = email.split('@')[0];

            //     if (emailID) {
            //         query.replace("EMAIL_ID", emailID);
            //         const response = await fetchWithTimeout(query);

            //         if (response.status == 200 && response.body) {
            //             console.log(response);
            //             const responseText = new TextDecoder().decode((await response.body.getReader().read()).value);
            //             const userJSON = JSON.parse(responseText);
                        
            //         }
            //     }
            // }

            response = new Response(JSON.stringify(classProperties), { status: 200 });
        } else {
            response = new Response(null, { status: 200 });
        }
    } else {
        response = new Response(null, { status: 200 });
    }

    return response;
}
