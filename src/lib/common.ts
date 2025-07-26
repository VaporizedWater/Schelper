import { EventInput } from "@fullcalendar/core/index.js";
import {
    CalendarInfo,
    CalendarState,
    CalendarType,
    ClassData,
    ClassProperty,
    CombinedClass,
    FacultyType,
    tagListType,
    tagType,
    UserSettingType,
} from "./types";
import { Document } from "mongodb";

/// FUNCTIONS
export function documentToClass(doc: Document): ClassData {
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
        owners: doc.owners,
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
        info: {
            _id: "",
            semester: "",
            year: new Date().getFullYear(),
            name: "Select a Calendar",
        },
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
            Fri: [],
        },
    };
}

export function createEventsFromCombinedClass(combinedClass: CombinedClass, isEditable?: boolean): EventInput[] {
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
        const nameSplit = combinedClass.properties.instructor_name.split(",");
        const lastName = nameSplit.length > 1 ? nameSplit[0].trim() : "";

        events.push({
            display: "auto",
            title: combinedClass.data.course_subject + combinedClass.data.course_num + "\n" + lastName,
            start: dateStringStart || "",
            end: dateStringEnd || "",
            backgroundColor: defaultBackgroundColor,
            extendedProps: {
                combinedClassId: combinedClass._id,
            },
            priority: "b",
            editable: isEditable || false,
        });
    });

    return events;
}

// HELPER FUNCTIONS
// Helper functions
export const buildTagMapping = (classes: CombinedClass[], existingMapping?: tagListType): tagListType => {
    const mapping: tagListType = existingMapping || new Map();

    classes.forEach((cls) => {
        cls.properties.tags?.forEach((tag) => {
            if (!mapping.has(tag.tagName)) {
                mapping.set(tag.tagName, { tagCategory: tag.tagCategory, classIds: new Set() });
            }
            mapping.get(tag.tagName)?.classIds.add(cls._id);
        });
    });

    return mapping;
};

// Helper function to merge faculty entries
export const mergeFacultyEntries = (existingFaculty: FacultyType[] = [], newFaculty: FacultyType[] = []): FacultyType[] => {
    // Create a map of existing faculty for quick lookups
    const facultyMap = new Map<string, FacultyType>();
    existingFaculty.forEach((faculty) => {
        if (faculty.email) {
            facultyMap.set(faculty.email, { ...faculty });
        }
    });

    // Process each new faculty entry
    newFaculty.forEach((newEntry) => {
        if (!newEntry.email) return;

        if (facultyMap.has(newEntry.email)) {
            // Merge with existing entry
            const existingEntry = facultyMap.get(newEntry.email)!;
            facultyMap.set(newEntry.email, {
                ...existingEntry,
                unavailability: {
                    Mon: mergeDaySlots(existingEntry.unavailability.Mon, newEntry.unavailability.Mon),
                    Tue: mergeDaySlots(existingEntry.unavailability.Tue, newEntry.unavailability.Tue),
                    Wed: mergeDaySlots(existingEntry.unavailability.Wed, newEntry.unavailability.Wed),
                    Thu: mergeDaySlots(existingEntry.unavailability.Thu, newEntry.unavailability.Thu),
                    Fri: mergeDaySlots(existingEntry.unavailability.Fri, newEntry.unavailability.Fri),
                },
            });
        } else {
            // Add new entry
            facultyMap.set(newEntry.email, { ...newEntry });
        }
    });

    // Convert the map back to an array
    return Array.from(facultyMap.values());
};

// Helper function to merge time slots for a specific day
const mergeDaySlots = (existingSlots: EventInput[] = [], newSlots: EventInput[] = []): EventInput[] => {
    // If either array is empty, just return the other (or empty if both empty)
    if (existingSlots.length === 0) return [...newSlots];
    if (newSlots.length === 0) return [...existingSlots];

    // Helper function to convert time string "HH:MM" to minutes for easier comparison
    const timeToMinutes = (timeStr: string | undefined): number => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
    };

    // Helper function to convert minutes back to time string "HH:MM"
    const minutesToTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    };

    // Create a type-safe array of interval objects for processing
    type TimeInterval = { start: number; end: number; originalSlot: EventInput };

    // Combine all slots and convert to interval objects with numeric values
    const intervals: TimeInterval[] = [
        ...existingSlots.map((slot) => ({
            start: timeToMinutes(slot.start as string),
            end: timeToMinutes(slot.end as string),
            originalSlot: slot,
        })),
        ...newSlots.map((slot) => ({
            start: timeToMinutes(slot.start as string),
            end: timeToMinutes(slot.end as string),
            originalSlot: slot,
        })),
    ];

    // Sort by start time
    intervals.sort((a, b) => a.start - b.start);

    // Merge overlapping intervals
    const mergedIntervals: TimeInterval[] = [];

    for (const interval of intervals) {
        // If this is the first interval or if it doesn't overlap with the last merged interval
        if (mergedIntervals.length === 0 || interval.start > mergedIntervals[mergedIntervals.length - 1].end) {
            mergedIntervals.push(interval);
        } else {
            // Overlapping case: extend the end time of the last merged interval if needed
            mergedIntervals[mergedIntervals.length - 1].end = Math.max(
                mergedIntervals[mergedIntervals.length - 1].end,
                interval.end
            );
        }
    }

    // Convert back to EventInput format
    return mergedIntervals.map((interval) => {
        // Start with properties from one of the original slots
        const baseSlot = { ...interval.originalSlot };

        // Update only the start and end times
        return {
            ...baseSlot,
            start: minutesToTime(interval.start),
            end: minutesToTime(interval.end),
        };
    });
};

export function createCalendarFromInfo(calendarInfo: CalendarInfo): CalendarType {
    if (calendarInfo._id === undefined || calendarInfo._id === null || calendarInfo._id === "") {
        return {
            info: {
                _id: "",
                semester: calendarInfo.semester,
                year: calendarInfo.year,
                name: calendarInfo.name,
            },
            classes: [],
        };
    } else {
        return {
            _id: calendarInfo._id,
            info: {
                _id: calendarInfo._id,
                semester: calendarInfo.semester,
                year: calendarInfo.year,
                name: calendarInfo.name,
            },
            classes: [],
        };
    }
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

export const defaultSettings: UserSettingType = {
    settings: {
        conflicts: {
            all: "#ff0000",
            room: "#f59e0b",
            instructor: "#f59e0b",
            cohort: "#f59e0b",
            roomInstructor: "#f97316",
            roomCohort: "#f97316",
            instructorCohort: "#f97316",
        },
    },
};

// Initial Calendar state
export const initialCalendarState: CalendarState = {
    classes: {
        all: [],
        current: undefined,
        currentClasses: [],
    },
    tags: new Map(),
    status: {
        loading: true,
        error: null,
    },
    conflicts: [],
    user: null,
    currentCalendar: newDefaultEmptyCalendar(),
    calendars: [],
    faculty: [newDefaultEmptyFaculty()],
    conflictPropertyChanged: false,
    userSettings: defaultSettings,
};

export const darkenRGBColor = (color: string, amount: number = 0.2): string => {
    const hex = color.replace("#", "");
    const num = parseInt(hex, 16);

    const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
    const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * amount));
    const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * amount));

    return `rgb(${r}, ${g}, ${b})`;
};
