import { EventInput } from "@fullcalendar/core/index.js";
import { CalendarState, CalendarType, Class, ClassProperty, CombinedClass, FacultyType, tagType } from "./types";
import { Document } from "mongodb";

/// FUNCTIONS
export function documentToClass(doc: Document): Class {
    return {
        catalog_num: doc.catalog_num,
        class_num: doc.class_num,
        session: doc.session,
        course_subject: doc.course_subject,
        course_num: doc.course_num,
        section: doc.section,
        title: doc.title,
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
        cohort: doc.cohort,
        tags: doc.tags,
    };
}

export function newDefaultEmptyClass() {
    return {
        _id: "",
        data: {
            catalog_num: "",
            class_num: "",
            session: "",
            course_subject: "",
            course_num: "",
            section: "",
            title: "",
            enrollment_cap: "",
            waitlist_cap: "",
        },
        properties: {
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
            cohort: "",
            tags: [] as tagType[],
        },
        events: undefined,
        visible: true,
    } as CombinedClass;
}

export function newDefaultEmptyCalendar(): CalendarType {
    return {
        _id: "",
        semester: "",
        year: "",
        classes: [],
    };
}

export function newDefaultEmptyFaculty(): FacultyType {
    return {
        _id: "",
        email: "",
        unavailability: {
            Mon: [],
            Tue: [],
            Wed: [],
            Thu: [],
            Fri: []
        }
    };
}

export function createEventsFromCombinedClass(combinedClass: CombinedClass): EventInput[] {
    const events: EventInput[] = [];

    combinedClass.properties.days.forEach((day) => {
        const convertedDay = dayToDate[day];

        let startTime = combinedClass.properties.start_time;
        if (startTime.length == 4) {
            startTime = "0" + startTime;
        }

        let endTime = combinedClass.properties.end_time;
        if (endTime.length == 4) {
            endTime = "0" + endTime;
        }

        const dateStringStart = `${convertedDay}T${startTime}`;
        const dateStringEnd = `${convertedDay}T${endTime}`;

        events.push({
            display: "auto",
            title:
                combinedClass.data.course_subject +
                    combinedClass.data.course_num +
                    "\n" +
                    combinedClass.properties.instructor_name || "",
            start: dateStringStart || "",
            end: dateStringEnd || "",
            backgroundColor: defaultBackgroundColor,
            extendedProps: {
                combinedClassId: combinedClass._id,
            },
        });
    });

    return events;
}

/// CONSTANTS
export const defaultBackgroundColor = "#001e443f";
export const selectedBackgroundColor = "#001e44bd";

export const ShortenedDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export const viewFiveDays = {
    viewFiveDays: {
        type: "timeGrid",
        visibleRange: {
            start: "2025-01-06",
            end: "2025-01-11",
        },
    },
};

export const dayToDate: { [key: string]: string } = {
    Mon: "2025-01-06",
    Tue: "2025-01-07",
    Wed: "2025-01-08",
    Thu: "2025-01-09",
    Fri: "2025-01-10",
};

export const dayIndex: { [key: string]: number } = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
};

// Initial Calendar state
export const initialCalendarState: CalendarState = {
    classes: {
        all: [],
        // display: [],
        current: undefined,
    },
    tags: new Map(),
    status: {
        loading: true,
        error: null,
    },
    conflicts: [],
    user: null,
    currentCalendar: newDefaultEmptyCalendar(),
    faculty: [newDefaultEmptyFaculty()],
    conflictyPropertyChanged: false
};
