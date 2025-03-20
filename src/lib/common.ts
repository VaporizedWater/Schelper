import { EventInput } from "@fullcalendar/core/index.js";
import { CalendarState, Class, ClassProperty, CombinedClass } from "./types";
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
    let displayName = String(doc.instructor_name);
    if (displayName.length > 0) {
        const split = displayName.split(",");
        if (split.length == 2) {
            const first = split[1].trim();
            const last = split[0].trim();
            displayName = first + " " + last;
        }
    }

    return {
        _id: doc._id.toString(), // Ensure _id is converted to string
        class_status: doc.class_status,
        start_time: doc.start_time,
        end_time: doc.end_time,
        room: doc.room,
        facility_id: doc.facility_id,
        days: doc.days,
        instructor_email: doc.instructor_email,
        instructor_name: displayName,
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
        events: undefined,
    } as CombinedClass;
}

export function createEventsFromCombinedClass(combinedClass: CombinedClass): EventInput[] {
    const events: EventInput[] = [];

    combinedClass.classProperties.days.forEach(day => {
        const convertedDay = dayToDate[day];
        const dateStringStart = `${convertedDay}T${combinedClass.classProperties.start_time}`;
        const dateStringEnd = `${convertedDay}T${combinedClass.classProperties.end_time}`;

        events.push({
            display: "auto",
            title:
                combinedClass.classData.course_subject +
                    combinedClass.classData.course_num +
                    "\n" +
                    combinedClass.classProperties.instructor_name || "",
            start: dateStringStart || "",
            end: dateStringEnd || "",
            backgroundColor: defaultBackgroundColor,
            extendedProps: {
                combinedClassId: combinedClass.classData._id,
                linkedClassEvents: events
            },
        });
    });



    return events;
}

/// CONSTANTS
export const defaultBackgroundColor = '#001e443f';
export const selectedBackgroundColor = '#001e44bd';

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

// Initial Calendar state
export const initialCalendarState: CalendarState = {
    classes: {
        all: [],
        display: [],
        current: undefined,
    },
    events: {
        all: [],
        display: [],
    },
    tags: {
        all: new Set(),
        mapping: new Map(),
    },
    status: {
        loading: true,
        error: null,
    },
    conflicts: [],
};
