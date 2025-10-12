import { EventInput } from "@fullcalendar/core/index.js";
import {
    CalendarInfo,
    CalendarState,
    CalendarType,
    ClassData,
    ClassInfo,
    ClassProperty,
    CohortType,
    CombinedClass,
    DaySlots,
    DepartmentType,
    FacultyInfo,
    FacultyType,
    SemesterCourses,
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
            name: "No Calendars",
        },
        classes: [],
    };
}

export function newDefaultEmptyFaculty(): FacultyType {
    return {
        _id: "",
        email: "",
        classUnavailability: {
            Mon: [],
            Tue: [],
            Wed: [],
            Thu: [],
            Fri: [],
        },
        addedUnavailability: {
            Mon: [],
            Tue: [],
            Wed: [],
            Thu: [],
            Fri: [],
        },
    };
}

export const EMPTY_DAY_SLOTS: DaySlots = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [] };

export function normalizeDaySlots(ds?: DaySlots): DaySlots {
    return {
        Mon: Array.isArray(ds?.Mon) ? ds!.Mon : [],
        Tue: Array.isArray(ds?.Tue) ? ds!.Tue : [],
        Wed: Array.isArray(ds?.Wed) ? ds!.Wed : [],
        Thu: Array.isArray(ds?.Thu) ? ds!.Thu : [],
        Fri: Array.isArray(ds?.Fri) ? ds!.Fri : [],
    };
}

export function newSemesterCourses(): SemesterCourses {
    return {
        Spring: [],
        Fall: [],
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

// Helper function to merge time slots for a specific day
export const mergeDaySlots = (...lists: EventInput[][]): EventInput[] => {
    // Flatten and sanitize input
    const flat = (lists.flat() as EventInput[]).filter(Boolean);
    if (flat.length === 0) return [];

    // "HH:MM" -> minutes
    const toMin = (t?: string) => {
        if (!t) return NaN;
        const [h, m] = t.split(":").map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
        return h * 60 + m;
    };

    // minutes -> "HH:MM"
    const toHHMM = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    type Seg = { start: number; end: number; base?: EventInput };

    // Convert to numeric intervals; drop invalid/empty (start >= end)
    const intervals: Seg[] = [];
    for (const slot of flat) {
        const s = toMin(slot.start as string);
        const e = toMin(slot.end as string);
        if (!Number.isFinite(s) || !Number.isFinite(e)) continue;
        if (s >= e) continue;
        intervals.push({ start: s, end: e, base: slot });
    }

    if (intervals.length === 0) return [];

    // Sort by start (then end)
    intervals.sort((a, b) => a.start - b.start || a.end - b.end);

    // Merge overlapping/contiguous intervals
    const merged: Seg[] = [];
    for (const cur of intervals) {
        const last = merged[merged.length - 1];
        if (!last || cur.start > last.end) {
            merged.push({ ...cur });
        } else {
            last.end = Math.max(last.end, cur.end);
        }
    }

    // Convert back to EventInput, preserving any extra properties from a source slot
    return merged.map((seg) => ({
        ...(seg.base ?? {}),
        start: toHHMM(seg.start),
        end: toHHMM(seg.end),
    }));
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

export function createDepartmentFromInfo(departmentInfo: { name: string }): DepartmentType {
    return {
        name: departmentInfo.name,
        faculty_list: [] as FacultyInfo[],
        cohorts: [] as CohortType[],
        current_cohort: "",
        class_list: [] as ClassInfo[],
    };
}

export function computeAddedUnavailability(current: DaySlots | undefined, incoming: DaySlots, merge: boolean): DaySlots {
  const cur = normalizeDaySlots(current);
  const inc = normalizeDaySlots(incoming);

  if (merge) {
    return {
      Mon: mergeDaySlots(cur.Mon, inc.Mon),
      Tue: mergeDaySlots(cur.Tue, inc.Tue),
      Wed: mergeDaySlots(cur.Wed, inc.Wed),
      Thu: mergeDaySlots(cur.Thu, inc.Thu),
      Fri: mergeDaySlots(cur.Fri, inc.Fri),
    };
  }

  // replace (no merge) – caller provides the fully-updated set (e.g., with the deletion applied)
  return inc;
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
    conflictPropertyChanged: false,
    userSettings: defaultSettings,
    departments: {
        all: [],
        current: null,
    },
    departmentFaculty: [],
};

export const darkenRGBColor = (color: string, amount: number = 0.2): string => {
    const hex = color.replace("#", "");
    const num = parseInt(hex, 16);

    const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
    const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * amount));
    const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * amount));

    return `rgb(${r}, ${g}, ${b})`;
};
