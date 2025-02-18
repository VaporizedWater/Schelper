import { EventInput } from "@fullcalendar/core/index.js";
import { ReactNode } from "react";

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

    // tags with id and name
    tags: { id: string; name: string }[];
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

export type CalendarContextType = {
    currCombinedClass: CombinedClass | undefined;
    updateCurrClass: (newCombinedClass: CombinedClass) => void;
    allClasses: CombinedClass[];
    updateAllClasses: (newClasses: CombinedClass[]) => void;
    displayClasses: CombinedClass[];
    updateDisplayClasses: (newDisplayClasses: CombinedClass[]) => void;
    allEvents: EventInput[];
    displayEvents: EventInput[];
    updateDisplayEvents: (newDisplayEvents: EventInput[]) => void;
    tagList: Map<string, { tagName: string; classIds: Set<string> }>; // Map of tags to a set of class ids
    updateCurrentClass: (newClass: CombinedClass) => void;
};
