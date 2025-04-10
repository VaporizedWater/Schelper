import { EventInput } from "@fullcalendar/core/index.js";
import { Session } from "next-auth";
import { ReactNode } from "react";

export type tagListType = Map<string, Set<string>>; // Map of tag ids to a set of class ids

export type TagType = {
    _id: string;
};

export type SVGProps = {
    className?: string | undefined;
    width?: string | undefined;
    height?: string | undefined;
    fill_color?: string | undefined;
    stroke_width?: string | undefined;
    stroke_color?: string | undefined;
};

export type EventInfo = {
    event: EventInput;
    timeText: string;
    isStart: boolean;
    isEnd: boolean;
    isMirror: boolean;
    isPast: boolean;
    isFuture: boolean;
    isToday: boolean;
    el: HTMLElement;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    view: any; // FullCalendar "View Object"
};

export type Class = {
    // unchanging identifiers
    catalog_num: string;
    class_num: string;
    session: string;
    course_subject: string;
    course_num: string;
    section: string;
    title: string;
    location: string;
    enrollment_cap: string;
    waitlist_cap: string;
};

export type ClassProperty = {
    // editable properties
    class_status: string;
    start_time: string;
    end_time: string;
    room: string;
    facility_id: string;
    days: string[];
    instructor_email: string;
    instructor_name: string;
    total_enrolled: string;
    total_waitlisted: string;
    cohort: string;
    tags: string[];
};

export type CombinedClass = {
    _id: string;
    data: Class;
    properties: ClassProperty;
    events: EventInput | undefined;
};

// This serves as a type to transport the calendar/class data from the API to the calendar context via LoadCalendar (previously LoadCombinedClasses)
export type CalendarType = {
    _id: string;
    semester: string;
    year: string;
    classes: CombinedClass[]
};

export type DropDownProps = {
    /** Function to render the button content */
    renderButton: (isOpen: boolean) => ReactNode;
    /** Function to render the dropdown content */
    renderDropdown: () => ReactNode;
    /** Additional class names */
    buttonClassName?: string;
    dropdownClassName?: string;
    alwaysOpen?: boolean;
};

export type ButtonDropDownProps = {
    title: string;
    items: { link: string; content: string }[];
    type: string;
};

export type CalendarOpenProps = {
    toggleCalendar: (isOpen: boolean) => void;
};

export type ReactNodeChildren = {
    children: ReactNode;
};

export type ConflictType = {
    class1: CombinedClass;
    class2: CombinedClass;
    conflictType: string;
};

export type CalendarContextType = {
    currentCalendarId: string;

    allClasses: CombinedClass[];
    displayClasses: CombinedClass[];
    currentCombinedClass?: CombinedClass | undefined;

    allTags: Set<string>;
    tagList: tagListType; // Map of tags to a set of class ids

    isLoading: boolean;
    error: string | null;

    conflicts: ConflictType[];

    resetContextToEmpty: () => void;

    setCurrentClass: (newClasses: CombinedClass) => void;

    updateOneClass: (combinedClassToUpdate: CombinedClass) => void;

    updateAllClasses: (newClasses: CombinedClass[]) => void;

    updateDisplayClasses: (newDisplayClasses: CombinedClass[]) => void;

    detectConflicts: () => void;

    unlinkTagFromClass: (classId: string, tagId: string) => void;

    unlinkAllTagsFromClass: (classId: string) => void;

    unlinkAllClassesFromTag: (tagId: string) => void;

    unlinkAllTagsFromAllClasses: () => void;

    uploadNewClasses: (uploadedClasses: CombinedClass[]) => void;

    deleteClass: (classId: string) => void;
};

export type UserType = {
    userId: string;
    email: string;
    current_calendar: string;
    calendars: CalendarType[];
};

export type CalendarState = {
    classes: {
        all: CombinedClass[];
        display: CombinedClass[];
        current: CombinedClass | undefined;
    };
    tags: {
        all: Set<string>;
        mapping: tagListType;
    };
    status: {
        loading: boolean;
        error: string | null;
    };
    conflicts: ConflictType[];
    user: Session | null;
    currentCalendarId: string;
};

export type CalendarAction =
    | { type: "INITIALIZE_DATA"; payload: { classes: CombinedClass[]; tags: Set<string>, currentCalendarId: string} }
    | { type: "SET_DISPLAY_CLASSES"; payload: CombinedClass[] }
    | { type: "SET_CURRENT_CLASS"; payload: CombinedClass }
    | { type: "UPDATE_CLASS"; payload: CombinedClass }
    | { type: "SET_CONFLICTS"; payload: ConflictType[] }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "UNLINK_TAG_FROM_CLASS"; payload: { tagId: string; classId: string } }
    | { type: "UNLINK_ALL_TAGS_FROM_CLASS"; payload: string }
    | { type: "UNLINK_ALL_CLASSES_FROM_TAG"; payload: string }
    | { type: "UNLINK_ALL_TAGS_FROM_ALL_CLASSES" }
    | { type: "UPLOAD_CLASSES"; payload: CombinedClass[] }
    | { type: "DELETE_CLASS"; payload: string };

export type Faculty = {
    _id?: string;
    name: string;
    unavailability: {
        mon: { start: string; end: string }[];
        tue: { start: string; end: string }[];
        wed: { start: string; end: string }[];
        thu: { start: string; end: string }[];
        fri: { start: string; end: string }[];
    };
};

// export type CalendarData = {
//     _id: string;
//     classes: string[];
//     semester: string;
//     year: string;
// };

export type UserData = {
    success: boolean;
    calendar: {
        _id: string;
        email: string;
        calendars: string[];
        current_calendar: string;
    };
};
