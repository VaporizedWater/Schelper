import { EventInput } from "@fullcalendar/core/index.js";
import { ReactNode } from "react";

export type tagListType = Map<string, { classIds: Set<string> }>;

export type Class = {
    // unchanging identifiers
    _id: string;
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
    _id: string;
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
    tags: string[];
};

export type CombinedClass = {
    classData: Class;
    classProperties: ClassProperty;
    event: EventInput | undefined;
};

export type DropDownProps = {
    /** Function to render the button content */
    renderButton: (isOpen: boolean) => ReactNode;
    /** Function to render the dropdown content */
    renderDropdown: () => ReactNode;
    /** Additional class names */
    buttonClassName?: string;
    dropdownClassName?: string;
};

export type ButtonDropDownProps = {
    title: string;
    items: { link: string; content: string }[];
    type: string;
};

export type FullCalendarClassEvent = {
    title: string;
    day: string;
    startTime: string;
    endTime: string;
};

export type CalendarOpenProps = {
    toggleCalendar: (isOpen: boolean) => void;
};

export type ProviderProps = {
    children: ReactNode;
};

export type ConflictType = {
    class1: CombinedClass;
    class2: CombinedClass;
    conflictType: string;
};

export type CalendarContextType = {
    isLoading: boolean;
    error: string | null;

    allClasses: CombinedClass[];
    displayClasses: CombinedClass[];
    currentCombinedClass?: CombinedClass | undefined;

    allEvents: EventInput[];
    displayEvents: EventInput[];

    allTags: Set<string>;
    tagList: tagListType; // Map of tags to a set of class ids

    conflicts: ConflictType[];

    setCurrentClass: (newCombinedClass: CombinedClass) => void;

    updateOneClass: (combinedClassToUpdate: CombinedClass) => void;

    updateAllClasses: (newClasses: CombinedClass[], updateEvents?: boolean) => void;

    updateDisplayClasses: (newDisplayClasses: CombinedClass[], updateEvents?: boolean) => void;

    detectConflicts: () => void;

    unlinkTagFromClass: (classId: string, tagId: string) => void;

    unlinkAllTagsFromClass: (classId: string) => void;

    unlinkAllClassesFromTag: (tagId: string) => void;

    unlinkAllTagsFromAllClasses: () => void;

    uploadNewClasses: (uploadedClasses: CombinedClass[]) => void;
};

export type CalendarState = {
    classes: {
        all: CombinedClass[];
        display: CombinedClass[];
        current: CombinedClass | undefined;
    };
    events: {
        all: EventInput[];
        display: EventInput[];
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
};

export type CalendarAction =
    | { type: "INITIALIZE_DATA"; payload: { classes: CombinedClass[]; tags: Set<string> } }
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
    | { type: "UPLOAD_CLASSES"; payload: CombinedClass[] };
