import { ObjectId } from "mongodb";

export type Class = {
    // unchanging identifiers
    object_id: string;
    associated_properties: string;
    catalog_num: string;
    class_num: string;
    session: string;
    course_subject: string;
    course_num: string;
    section: string;
    title: string;
    location: string;
    min_units: string;
    max_units: string;
    enrollment_cap: string;
    waitlist_cap: string;
};

export type ClassProperty = {
    // editable properties
    object_id: string;
    associated_class: string;
    class_status: string;
    start_time: string;
    end_time: string;
    room: string;
    facility_id: string;
    days: string[];
    start_date: string;
    end_date: string;
    instructor_email: string;
    instructor_name: string;
    total_enrolled: string;
    total_waitlisted: string;
};

export type DayProps = {
    dayName: string;
    date: number;
};

export type PropertyProps = {
    property: string;
    value: string;
};

export type TagProps = {
    tagName: string;
    classes: number[];
};

export type TagPropList = {
    tags: TagProps[];
};

export type ClassIdProps = {
    classId: string;
};
