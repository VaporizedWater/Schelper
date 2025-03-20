"use client";

import { useState, useEffect, useMemo } from "react";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import Spreadsheet, { Matrix } from "react-spreadsheet";
import { EventInput } from "@fullcalendar/core/index.js";
import { Class, ClassProperty, CombinedClass } from "@/lib/types";
import { updateCombinedClass, bulkUpdateClasses } from "@/lib/utils";
import { createEventsFromCombinedClass } from "@/lib/common";

export default function CalendarSheet() {
    // Get the data from the combined classes in calendar context
    const { allClasses, updateAllClasses, updateDisplayClasses } = useCalendarContext();

    // Track modified rows for efficient updates
    const [modifiedRows, setModifiedRows] = useState<Set<number>>(new Set());
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateStatus, setUpdateStatus] = useState<{ success: boolean; message: string } | null>(null);

    // Compute a hidden mapping of row index (starting at 0 for first data row) to class id.
    const classIds = allClasses.map((item) => item.classData._id);

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

    // Reset pending data when allClasses changes
    useEffect(() => {
        // Convert allClasses data to our expected spreadsheet matrix.
        const newInitialData: Matrix<{ value: string }> = [
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

        setPendingData(newInitialData);
        setModifiedRows(new Set());
        setUpdateStatus(null);
    }, [allClasses, headers]);

    // Handle changes and track modified rows
    const handleSpreadsheetChange = (newData: Matrix<{ value: string }>, cell?: { row: number, column: number }) => {
        setPendingData(newData);

        // Track which row was modified (if cell info is available)
        if (cell && cell.row > 0) {
            setModifiedRows(prev => {
                const newSet = new Set(prev);
                newSet.add(cell.row - 1); // Subtract 1 to account for header row
                return newSet;
            });
        }

        // Clear any previous status message when changes are made
        setUpdateStatus(null);
    };

    // Process updates when Enter is pressed
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            processUpdates();
        }
    };

    // Move the update logic to a separate async function
    const processUpdates = async () => {
        // If no rows were modified, no need to process updates
        if (modifiedRows.size === 0) return;

        setIsUpdating(true);
        setUpdateStatus(null);

        try {
            // Prepare classes to update (only those that were modified)
            const classesToUpdate: CombinedClass[] = Array.from(modifiedRows).map(rowIdx => {
                const row = pendingData[rowIdx + 1]; // +1 because of header row
                const id = classIds[rowIdx];
                const existing = allClasses.find((item) => item.classData._id === id);

                if (!id || !existing) {
                    console.warn(`Missing ID or existing class for row ${rowIdx + 1}`);
                    return null;
                }

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
                    _id: id, // Ensure we use the same ID for class properties
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
                    tags: row[18]?.value ? row[18].value.split(",").map((t) => t.trim()).sort() : [],
                };

                const newEvent: EventInput = createEventsFromCombinedClass({
                    classData: newData,
                    classProperties: newProperties,
                    events: undefined
                } as CombinedClass);

                return {
                    classData: newData,
                    classProperties: newProperties,
                    events: newEvent
                } as CombinedClass;
            }).filter(Boolean) as CombinedClass[];

            if (classesToUpdate.length === 0) {
                setUpdateStatus({ success: false, message: "No valid classes to update" });
                return;
            }

            // Choose update strategy based on number of modified rows
            let success = false;

            if (classesToUpdate.length === 1) {
                // For single class update, use individual update for efficiency
                success = await updateCombinedClass(classesToUpdate[0]);
            } else {
                // For multiple classes, use bulk update
                success = await bulkUpdateClasses(classesToUpdate);
            }

            if (success) {
                // Only update the context if database update was successful

                // Create a new array with updated classes replacing the originals
                const updatedAllClasses = allClasses.map(cls => {
                    const updated = classesToUpdate.find(u => u.classData._id === cls.classData._id);
                    return updated || cls;
                });

                updateAllClasses(updatedAllClasses, false);
                updateDisplayClasses(updatedAllClasses.filter(cls =>
                    classesToUpdate.some(u => u.classData._id === cls.classData._id)
                ), false);

                // Clear modified rows after successful update
                setModifiedRows(new Set());
                setUpdateStatus({
                    success: true,
                    message: `Successfully updated ${classesToUpdate.length} class(es)`
                });
            } else {
                setUpdateStatus({
                    success: false,
                    message: "Failed to update classes. Please try again."
                });
            }
        } catch (error) {
            console.error("Error updating classes:", error);
            setUpdateStatus({
                success: false,
                message: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Status and notification area */}
            <div className="flex-none">
                {updateStatus && (
                    <div className={`mb-4 p-2 rounded-sm ${updateStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {updateStatus.message}
                    </div>
                )}

                {isUpdating && (
                    <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded-sm">
                        Updating classes... Please wait.
                    </div>
                )}

                {modifiedRows.size > 0 && (
                    <div className="mb-2 text-sm text-gray-600">
                        {modifiedRows.size} row(s) modified. Press Enter to save changes.
                    </div>
                )}
            </div>

            {/* Spreadsheet container with explicit height */}
            <div className="grow overflow-auto h-[calc(100vh-220px)]">
                <Spreadsheet
                    data={pendingData}
                    onChange={isUpdating ? undefined : handleSpreadsheetChange}
                    onKeyDown={handleKeyDown}
                    className="w-full"
                />
            </div>
        </div>
    );
}