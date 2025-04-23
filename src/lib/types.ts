import { EventInput } from "@fullcalendar/core/index.js";
import { ObjectId } from "mongodb";
import { Session } from "next-auth";
import { ReactNode } from "react";

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
    tags: tagType[];
};

export type CombinedClass = {
    _id: string;
    data: Class;
    properties: ClassProperty;
    events: EventInput | undefined;
    visible: boolean;
};

// This serves as a type to transport the calendar/class data from the API to the calendar context via LoadCalendar (previously LoadCombinedClasses)
export type CalendarType = {
    _id: string;
    semester: string;
    year: string;
    classes: CombinedClass[];
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
    defaultOpen?: boolean;
};

export type ButtonDropDownProps = {
    title: string;
    items: { link: string; content: string }[];
    type: string;
};

export type ModalNavigationProps = {
    CloseModal: () => void;
}

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

export type tagCategory = "cohort" | "room" | "instructor" | "subject" | "level" | "user";

export type tagType = { tagName: string; tagCategory: tagCategory };

export type tagListType = Map<string, { tagCategory: tagCategory; classIds: Set<string> }>; // Map of tag id to a set of class ids

// Usually same as CalendarState, but only include here if you want external objects to access context values and functions
export type CalendarContextType = {
    faculty: FacultyType[];

    currentCalendar: CalendarType;

    allClasses: CombinedClass[];
    displayClasses: CombinedClass[];
    currentCombinedClass?: CombinedClass | undefined;

    tagList: tagListType; // Map of tags to a set of class ids

    isLoading: boolean;
    error: string | null;

    conflicts: ConflictType[];

    toggleConflictPropertyChanged: () => void;

    resetContextToEmpty: () => void;

    setCurrentClass: (newClasses: CombinedClass) => void;

    updateOneClass: (combinedClassToUpdate: CombinedClass) => void;

    updateAllClasses: (newClasses: CombinedClass[]) => void;

    // detectConflicts: () => void;

    unlinkTagFromClass: (tagId: string, classId: string) => void;

    unlinkAllTagsFromClass: (classId: string) => void;

    unlinkAllClassesFromTag: (tagId: string) => void;

    unlinkAllTagsFromAllClasses: () => void;

    uploadNewClasses: (uploadedClasses: CombinedClass[]) => void;

    deleteClass: (classId: string) => void;

    updateFaculty: (faculty: FacultyType[], doMerge: boolean) => Promise<boolean>;

    deleteFaculty: (faculty: string) => void;
};

export type UserType = {
    userId: string;
    email: string;
    current_calendar: string;
    calendars: CalendarType[];
    current_cohort: ObjectId;
    cohorts: ObjectId[];
};

export type CalendarState = {
    classes: {
        all: CombinedClass[];
        current: CombinedClass | undefined;
    };
    tags: tagListType;
    status: {
        loading: boolean;
        error: string | null;
    };
    conflicts: ConflictType[];
    user: Session | null;
    currentCalendar: CalendarType;
    faculty: FacultyType[];
    conflictyPropertyChanged: boolean;
};

export type CalendarAction =
    | {
        type: "INITIALIZE_DATA";
        payload: { classes: CombinedClass[]; tags: tagListType; currentCalendar: CalendarType; faculty: FacultyType[] };
    }
    | { type: "TOGGLE_CONFLICT_PROPERTY_CHANGED"; payload: boolean }
    | { type: "SET_CURRENT_CLASS"; payload: CombinedClass }
    | { type: "UPDATE_CLASS"; payload: CombinedClass }
    | { type: "UPDATE_ALL_CLASSES"; payload: CombinedClass[] }
    | { type: "SET_CONFLICTS"; payload: ConflictType[] }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "UNLINK_TAG_FROM_CLASS"; payload: { tagId: string; classId: string } }
    | { type: "UNLINK_ALL_TAGS_FROM_CLASS"; payload: string }
    | { type: "UNLINK_ALL_CLASSES_FROM_TAG"; payload: string }
    | { type: "UNLINK_ALL_TAGS_FROM_ALL_CLASSES" }
    | { type: "UPLOAD_CLASSES"; payload: CombinedClass[] }
    | { type: "DELETE_CLASS"; payload: string }
    | { type: "UPDATE_FACULTY"; payload: FacultyType[] };

export type FacultyType = {
    _id?: string;
    email: string;
    unavailability: {
        Mon: EventInput[];
        Tue: EventInput[];
        Wed: EventInput[];
        Thu: EventInput[];
        Fri: EventInput[];
    };
};

export type CohortType = {
    _id?: string;
    freshman: string[];
    sophomore: string[];
    junior: string[];
    senior: string[];
};
