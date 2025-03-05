"use client";

import { useState } from "react";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import Spreadsheet, { Matrix } from "react-spreadsheet";
// import { updateCombinedClass } from "@/lib/utils";
import { EventInput } from "@fullcalendar/core/index.js";
import { Class, ClassProperty, CombinedClass } from "@/lib/types";
import { updateCombinedClass } from "@/lib/utils";
import { createEventFromCombinedClass } from "@/lib/common";

export default function CalendarSheet() {
    // Get the data from the combined classes in calendar context
    const { allClasses, updateAllClasses, updateDisplayClasses } = useCalendarContext();

    // Compute a hidden mapping of row index (starting at 0 for first data row) to class id.
    const classIds = allClasses.map((item) => item.classData._id);

    // Define headers separately so that we can prepend them to the data matrix.
    const headers: Matrix<{ value: string }> = [[
        { value: "Catalog Number" },
        { value: "Class Number" },
        { value: "Session" },
        { value: "Course Subject" },
        { value: "Course Number" },
        { value: "Section" },
        { value: "Title" },
        { value: "Location" },
        { value: "Class Status" },
        { value: "Start Time" },
        { value: "End Time" },
        { value: "Facility ID" },
        { value: "Room" },
        { value: "Days" },
        { value: "Instructor Name" },
        { value: "Instructor Email" },
        { value: "Enrollment Capacity" },
        { value: "Waitlist Capacity" },
        { value: "Tags" },
    ]];

    // Convert allClasses data to our expected spreadsheet matrix.
    const initialData: Matrix<{ value: string }> = [
        ...headers,
        ...allClasses.map((item) => [
            { value: String(item.classData.catalog_num) },
            { value: String(item.classData.class_num) },
            { value: String(item.classData.session) },
            { value: String(item.classData.course_subject) },
            { value: String(item.classData.course_num) },
            { value: String(item.classData.section) },
            { value: String(item.classData.title) },
            { value: String(item.classData.location) },
            { value: String(item.classProperties.class_status) },
            { value: String(item.classProperties.start_time) },
            { value: String(item.classProperties.end_time) },
            { value: String(item.classProperties.facility_id) },
            { value: String(item.classProperties.room) },
            { value: String(item.classProperties.days.join(', ')) },
            { value: String(item.classProperties.instructor_name) },
            { value: String(item.classProperties.instructor_email) },
            { value: String(item.classData.enrollment_cap) },
            { value: String(item.classData.waitlist_cap) },
            { value: String(item.classProperties.tags.join(', ')) },
        ]),
    ];

    const [pendingData, setPendingData] = useState<Matrix<{ value: string }>>(initialData);

    // Handle changes without immediate update
    const handleSpreadsheetChange = (newData: Matrix<{ value: string }>) => {
        setPendingData(newData);
    };

    // Process updates when Enter is pressed
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            processUpdates(pendingData);
        }
    };

    // Move the update logic to a separate function
    const processUpdates = (newData: Matrix<{ value: string }>) => {
        if (newData.length > 1) {
            const newClassesData: CombinedClass[] = newData.slice(1).map((row, idx) => {
                const id = classIds[idx]; // Get the id from the mapping
                console.log("id " + id);
                const existing = allClasses.find((item) => item.classData._id === id);

                const newData: Class = {
                    _id: id,
                    catalog_num: row[0]?.value ?? '',
                    class_num: row[1]?.value ?? '',
                    session: row[2]?.value ?? '',
                    course_subject: row[3]?.value ?? '',
                    course_num: row[4]?.value ?? '',
                    section: row[5]?.value ?? '',
                    title: row[6]?.value ?? '',
                    location: row[7]?.value ?? '',
                    enrollment_cap: row[16]?.value ?? '',
                    waitlist_cap: row[17]?.value ?? '',
                };

                const newProperties: ClassProperty = {
                    _id: existing?.classProperties._id ?? '',
                    class_status: row[8]?.value ?? '',
                    start_time: row[9]?.value ?? '',
                    end_time: row[10]?.value ?? '',
                    facility_id: row[11]?.value ?? '',
                    room: row[12]?.value ?? '',
                    days: row[13]?.value ? row[13].value.split(",").map((d) => d.trim()) : [],
                    instructor_name: row[14]?.value ?? '',
                    instructor_email: row[15]?.value ?? '',
                    total_enrolled: String(existing?.classProperties.total_enrolled ?? 0),
                    total_waitlisted: String(existing?.classProperties.total_waitlisted ?? 0),
                    // Tags but list is sorted and trimmed
                    tags: row[18]?.value ? row[18].value.split(",").map((t) => t.trim()).sort() : [],
                }

                const newEvent: EventInput = createEventFromCombinedClass({
                    classData: newData, classProperties: newProperties, event: undefined
                } as CombinedClass);

                return {
                    classData: newData,
                    classProperties: newProperties,
                    event: newEvent
                } as CombinedClass;
            });

            newClassesData.forEach(async (combinedClass) => {
                await updateCombinedClass(combinedClass);
            });

            updateAllClasses(newClassesData, false);
            updateDisplayClasses(newClassesData, false);
        }
    };

    return (
        <div className="overflow-scroll scrollbar-thin">
            <Spreadsheet
                data={pendingData}
                onChange={handleSpreadsheetChange}
                onKeyDown={handleKeyDown}
                className=""
            />
        </div>
    );
}