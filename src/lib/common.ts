import { EventInput } from "@fullcalendar/core/index.js";
import { Class, ClassProperty, CombinedClass, ExcelMappingEntry } from "./types";
import { Document } from "mongodb";

/// FUNCTIONS
export function documentToClass(doc: Document): Class {
    return {
        _id: doc._id.toString(), // Ensure _id is converted to string
        catalog_num: doc.catalog_num,
        class_num: doc.class_num,
        session: doc.session,
        course_subject: doc.course_subject,
        course_num: doc.course_num,
        section: doc.section,
        title: doc.title,
        location: doc.location,
        enrollment_cap: doc.enrollment_cap,
        waitlist_cap: doc.waitlist_cap,
    };
}

export function documentToClassProperty(doc: Document): ClassProperty {
    return {
        _id: doc._id.toString(), // Ensure _id is converted to string
        class_status: doc.class_status,
        start_time: doc.start_time,
        end_time: doc.end_time,
        room: doc.room,
        facility_id: doc.facility_id,
        days: doc.days,
        instructor_email: doc.instructor_email,
        instructor_name: doc.instructor_name,
        total_enrolled: doc.total_enrolled,
        total_waitlisted: doc.total_waitlisted,
        tags: doc.tags,
    };
}

export function newDefaultEmptyClass() {
    return {
        classData: {
            _id: "",
            catalog_num: "",
            class_num: "",
            session: "",
            course_subject: "",
            course_num: "",
            section: "",
            title: "",
            location: "",
            enrollment_cap: "",
            waitlist_cap: "",
        },
        classProperties: {
            _id: "",
            class_status: "",
            start_time: "",
            end_time: "",
            room: "",
            facility_id: "",
            days: [] as string[],
            instructor_email: "",
            instructor_name: "",
            total_enrolled: "",
            total_waitlisted: "",
            tags: [] as string[],
        },
        event: undefined,
    } as CombinedClass;
}

export function createEventFromCombinedClass(combinedClass: CombinedClass): EventInput {
    const convertedDay = dayToDate[combinedClass.classProperties.days[0]];
    const dateStringStart = `${convertedDay}T${combinedClass.classProperties.start_time}`;
    const dateStringEnd = `${convertedDay}T${combinedClass.classProperties.end_time}`;

    return {
        title:
            combinedClass.classData.course_subject +
            combinedClass.classData.course_num +
            "\n" +
            combinedClass.classProperties.instructor_name,
        start: dateStringStart,
        end: dateStringEnd,
        extendedProps: {
            combinedClassId: combinedClass.classData._id,
        },
    };
}

/// CONSTANTS
export const DayDisplayEndings: Map<string, string> = new Map([
    ["Mon", "day"],
    ["Tue", "sday"],
    ["Wed", "nesday"],
    ["Thu", "rsday"],
    ["Fri", "day"],
]);

export const ShortenedDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export const dayToDate: { [key: string]: string } = {
    Mon: "2025-01-06",
    Tue: "2025-01-07",
    Wed: "2025-01-08",
    Thu: "2025-01-09",
    Fri: "2025-01-10",
};

export const emptyCombinedClass: CombinedClass = {
    classData: {
        _id: "",
        catalog_num: "",
        class_num: "",
        session: "",
        course_subject: "",
        course_num: "",
        section: "",
        title: "",
        location: "",
        enrollment_cap: "",
        waitlist_cap: "",
    },
    classProperties: {
        _id: "",
        class_status: "",
        start_time: "",
        end_time: "",
        room: "",
        facility_id: "",
        days: [] as string[],
        instructor_email: "",
        instructor_name: "",
        total_enrolled: "",
        total_waitlisted: "",
        tags: [] as string[],
    },
    event: undefined,
};

// Map Excel column names to our data model properties
export const EXCEL_MAPPING: Record<string, ExcelMappingEntry> = {
    // Class data mappings
    "Catalog #": { target: "classData", property: "catalog_num" },
    "Class #": { target: "classData", property: "class_num" },
    Session: { target: "classData", property: "session" },
    Course: { target: "classData", property: "course_subject" },
    Title: { target: "classData", property: "title" },
    Location: { target: "classData", property: "location" },
    "Enr Cpcty": { target: "classData", property: "enrollment_cap" },
    "Wait Cap": { target: "classData", property: "waitlist_cap" },
    Section: { target: "classData", property: "section" },

    // Class properties mappings
    "Class Stat": { target: "classProperties", property: "class_status" },
    Start: { target: "classProperties", property: "start_time", convert: "time" },
    End: { target: "classProperties", property: "end_time", convert: "time" },
    Room: { target: "classProperties", property: "room" },
    "Facility ID": { target: "classProperties", property: "facility_id" },
    "Instructor Email": { target: "classProperties", property: "instructor_email" },
    "Instructor Name": { target: "classProperties", property: "instructor_name" },
    "Tot Enrl": { target: "classProperties", property: "total_enrolled" },
    "Wait Tot": { target: "classProperties", property: "total_waitlisted" },

    // Special handling columns
    Num: { target: "special", property: "course_num" },
    M: { target: "day", property: "Mon" },
    T: { target: "day", property: "Tue" },
    W: { target: "day", property: "Wed" },
    R: { target: "day", property: "Thu" },
    F: { target: "day", property: "Fri" },
};
