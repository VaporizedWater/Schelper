import { EventInput } from "@fullcalendar/core/index.js";
import { CSSProperties } from "react";

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

export type PropertyProps = {
    property: string;
    value: string;
};

export type TagProps = {
    tagName: string;
};

export type TagPropList = {
    tags: TagProps[];
};

export type TimeGridCellProps = {
    droppableId: string;
};

export type DayProps = {
    day: string;
};

export type DayDateProps = {
    day: string;
    date: number;
};

export type DropDownItemProps = {
    content: string;
    iconUrl: string | null;
    iconAlt: string | null;
    link: string;
};

export type DropDownInfo = {
    title: string;
    titleInfo: string;
    dropType: string;
    list: DropDownItemProps[];
};

export type DraggableProps = {
    id: string;
    style?: CSSProperties;
    children?: JSX.Element;
};

export type standardTimeSlot = {
    start: string;
    end: string;
};

export type CalendarProps = {
    classes: CombinedClass[];
    standardTimeSlots: standardTimeSlot[];
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
