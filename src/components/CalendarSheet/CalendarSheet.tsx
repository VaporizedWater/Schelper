"use client";

import { useState, useEffect, useMemo } from "react";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import Spreadsheet, { Matrix } from "react-spreadsheet";
import { EventInput } from "@fullcalendar/core/index.js";
import { Class, ClassProperty, CombinedClass } from "@/lib/types";
import { updateCombinedClasses } from "@/lib/utils";
import { createEventsFromCombinedClass } from "@/lib/common";

export default function CalendarSheet() {
    // Get the data from the combined classes in calendar context
    const { allClasses, updateAllClasses, updateDisplayClasses } = useCalendarContext();

    // Compute a hidden mapping of row index (starting at 0 for first data row) to class id.
    const classIds = allClasses.map((item) => item._id);

    // Define headers separately so that we can prepend them to the data matrix.
    const headers = useMemo<Matrix<{ value: string }>>(() => [[
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
    ]], []);

    const spreadsheetData = useMemo(() => [
        ...headers,
        ...allClasses.map((item) => [
            { value: String(item.data.catalog_num) },
            { value: String(item.data.class_num) },
            { value: String(item.data.session) },
            { value: String(item.data.course_subject) },
            { value: String(item.data.course_num) },
            { value: String(item.data.section) },
            { value: String(item.data.title) },
            { value: String(item.data.location) },
            { value: String(item.properties.class_status) },
            { value: String(item.properties.start_time) },
            { value: String(item.properties.end_time) },
            { value: String(item.properties.facility_id) },
            { value: String(item.properties.room) },
            { value: String(item.properties.days.join(', ')) },
            { value: String(item.properties.instructor_name) },
            { value: String(item.properties.instructor_email) },
            { value: String(item.data.enrollment_cap) },
            { value: String(item.data.waitlist_cap) },
            { value: String(item.properties.tags.join(', ')) },
        ]),
    ], [allClasses, headers]);

    const [pendingData, setPendingData] = useState<Matrix<{ value: string }>>(spreadsheetData);

    useEffect(() => {
        setPendingData(spreadsheetData);
    }, [spreadsheetData]);

    // Handle changes and track modified rows
    const handleSpreadsheetChange = (newData: Matrix<{ value: string }>) => {
        setPendingData(newData);
    };

    // Process updates when Enter is pressed
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            processUpdates(pendingData);
        }
    };

    // Move the update logic to a separate async function
    const processUpdates = async (newData: Matrix<{ value: string }>) => {

        try {
            // Prepare classes to update (only those that were modified)
            const classesToUpdate: CombinedClass[] = newData.slice(1).map((row, idx) => {
                const id = classIds[idx]; // Get the id from the mapping
                console.log("id " + id);
                const existing = allClasses.find((item) => item._id === id);

                console.log("existing ", existing);

                const newData: Class = {
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
                    class_status: row[8]?.value ?? '',
                    start_time: row[9]?.value ?? '',
                    end_time: row[10]?.value ?? '',
                    facility_id: row[11]?.value ?? '',
                    room: row[12]?.value ?? '',
                    days: row[13]?.value ? row[13].value.split(",").map((d) => d.trim()) : [],
                    instructor_name: row[14]?.value ?? '',
                    instructor_email: row[15]?.value ?? '',
                    total_enrolled: String(existing?.properties.total_enrolled ?? 0),
                    total_waitlisted: String(existing?.properties.total_waitlisted ?? 0),
                    tags: row[18]?.value ? row[18].value.split(",").map((t) => t.trim()).sort() : [],
                };

                const newEvent: EventInput = createEventsFromCombinedClass({
                    data: newData,
                    properties: newProperties,
                    events: undefined
                } as CombinedClass);

                return {
                    _id: id,
                    data: newData,
                    properties: newProperties,
                    events: undefined,
                } as CombinedClass;
            }).filter(Boolean) as CombinedClass[];

            const success = await updateCombinedClasses(classesToUpdate);

            if (success) {
                console.log("Classes updated successfully");
                // Only update the context if database update was successful

                // Create a new array with updated classes replacing the originals
                const updatedAllClasses = allClasses.map(cls => {
                    const updated = classesToUpdate.find(u => u._id === cls._id);
                    return updated || cls;
                });

                updateAllClasses(updatedAllClasses);
                updateDisplayClasses(updatedAllClasses.filter(cls =>
                    classesToUpdate.some(u => u._id === cls._id)
                ));
            }
        } catch (error) {
            console.error("Error updating classes:", error);
        }
    };

    return (
        <div className="grow overflow-auto h-[calc(100vh-220px)]">
            <Spreadsheet
                data={pendingData}
                onChange={handleSpreadsheetChange}
                onKeyDown={handleKeyDown}
                className="w-full"
            />
        </div>
    );
}