import clientPromise from "@/lib/mongodb";
import { Document, ObjectId } from "mongodb";

export async function GET(request: Request) {
    const client = await clientPromise;
    const classTable = client.db('class-scheduling-app').collection('classes');

    const classID = request.headers.get('id') + '';

    let response: Response, data;

    if (classID.length) {
        const objID = new ObjectId(classID);
        data = await classTable.findOne({ '_id': objID });

        if (data) {
            const dataDoc: Document = data;
            const classProperties = {
                'catalog_num': dataDoc.catalog_num,
                'class_num': dataDoc.class_num,
                'session': dataDoc.session,
                'course_subject': dataDoc.course_subject,
                'course_num': dataDoc.course_num,
                'section': dataDoc.section,
                'title': dataDoc.title,
                'location': dataDoc.location,
                'class_status': dataDoc.class_status,
                'instr_mode': dataDoc.instr_mode,
                'start_time': dataDoc.start_time,
                'end_time': dataDoc.end_time,
                'facility_id': dataDoc.facility_id,
                'room': dataDoc.room,
                'room_capacity': dataDoc.room_capacity,
                'days': dataDoc.days,
                'start_date': dataDoc.start_date,
                'end_date': dataDoc.end_date,
                'instructor_name': dataDoc.instructor_name,
                'instructor_email': dataDoc.instructor_email,
                'min_units': dataDoc.min_units,
                'max_units': dataDoc.max_units,
                'total_enrolled': dataDoc.total_enrolled,
                'enrollment_cap': dataDoc.enrollment_cap,
                'total_waitlisted': dataDoc.total_waitlisted,
                'waitlist_cap': dataDoc.waitlist_cap,
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

