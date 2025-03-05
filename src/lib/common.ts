import { EventInput } from "@fullcalendar/core/index.js";
import { Class, ClassProperty, CombinedClass } from "./types";
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
        display: "auto",
        title:
            combinedClass.classData.course_subject +
                combinedClass.classData.course_num +
                "\n" +
                combinedClass.classProperties.instructor_name || "",
        start: dateStringStart || "",
        end: dateStringEnd || "",
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
