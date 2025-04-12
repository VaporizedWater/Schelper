"use client";

import { useState, useEffect, useMemo } from "react";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import Spreadsheet, { Selection, Matrix, RangeSelection, EntireRowsSelection, EntireColumnsSelection } from "react-spreadsheet";
import { Class, ClassProperty, CombinedClass } from "@/lib/types";
import { updateCombinedClasses } from "@/lib/DatabaseUtils";

export default function CalendarSheet() {
    // Get the data from the combined classes in calendar context
    const { allClasses, updateAllClasses, setCurrentClass, currentCombinedClass, isLoading, currentCalendar } = useCalendarContext();

    // Add state to track selected row index
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

    // Compute a hidden mapping of row index (starting at 0 for first data row) to class id.
    // Use useMemo instead of a regular variable + useEffect
    const classIds = useMemo(() => {
        return allClasses.filter(cls => cls.visible).map((item) => item._id);
    }, [allClasses]);

    // Update selected row when currentClass changes in context
    useEffect(() => {
        if (currentCombinedClass) {
            const rowIndex = classIds.findIndex(id => id === currentCombinedClass._id);
            if (rowIndex !== -1) {
                setSelectedRowIndex(rowIndex);
            }
        }
    }, [currentCombinedClass, classIds]);

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
        ...allClasses.filter(cls => cls.visible).map((item, index) => {
            // Style for the selected row (index + 1 because headers are row 0)
            const isSelected = index === selectedRowIndex;

            return [
                { value: String(item.data.catalog_num), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.data.class_num), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.data.session), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.data.course_subject), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.data.course_num), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.data.section), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.data.title), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.data.location), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.properties.class_status), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.properties.start_time), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.properties.end_time), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.properties.facility_id), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.properties.room), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.properties.days.join(', ')), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.properties.instructor_name), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.properties.instructor_email), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.data.enrollment_cap), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.data.waitlist_cap), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.properties.cohort), className: isSelected ? 'bg-blue-100' : '' },
                { value: String(item.properties.tags.join(', ')), className: isSelected ? 'bg-blue-100' : '' },
            ];
        }),
    ], [allClasses, headers, selectedRowIndex]);

    const [pendingData, setPendingData] = useState<Matrix<{ value: string }>>(spreadsheetData);

    useEffect(() => {
        setPendingData(spreadsheetData);
    }, [spreadsheetData]);

    // Handle changes
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

                console.log("existing: ", existing);

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
                    cohort: row[18]?.value ?? '',
                    tags: row[19]?.value ? row[19].value.split(",").map((t) => t.trim()).sort() : [],
                };

                return {
                    _id: id,
                    data: newData,
                    properties: newProperties,
                    events: undefined,
                } as CombinedClass;
            }).filter(Boolean) as CombinedClass[];

            const success = await updateCombinedClasses(classesToUpdate, currentCalendar._id);

            if (success) {
                console.log("Classes updated successfully");
                // Only update the context if database update was successful

                // Create a new array with updated classes replacing the originals
                const updatedClasses = allClasses.map(cls => {
                    const updated = classesToUpdate.find(u => u._id === cls._id);
                    return updated || cls;
                });

                updateAllClasses(updatedClasses);
            }
        } catch (error) {
            console.error("Error updating classes:", error);
        }
    };

    const getIdsFromSelection = (selection: Selection) => {
        // Set to store unique row indexes (excluding header row)
        const rowIndexes = new Set<number>();

        // Find the type of selection
        if (selection instanceof RangeSelection) {
            // For range selection, get all rows in the range
            for (let i = selection.range.start.row; i <= selection.range.end.row; i++) {
                // Skip header row (row 0)
                if (i > 0) {
                    rowIndexes.add(i - 1); // Adjust index for header row
                }
            }
        } else if (selection instanceof EntireRowsSelection) {
            // For entire rows selection
            for (let i = selection.start; i <= selection.end; i++) {
                // Skip header row (row 0)
                if (i > 0) {
                    rowIndexes.add(i - 1); // Adjust index for header row
                }
            }
        } else if (selection instanceof EntireColumnsSelection) {
            // For entire columns, include all data rows
            for (let i = 0; i < classIds.length; i++) {
                rowIndexes.add(i);
            }
        }

        // Convert row indexes to class ids and return
        return Array.from(rowIndexes)
            .filter(idx => idx >= 0 && idx < classIds.length)
            .map(idx => classIds[idx]);
    };

    const handleSelection = (selection: Selection) => {
        // console.log("SELECTED: ! ", selection, getIdsFromSelection(selection));
        const ids = getIdsFromSelection(selection);

        if (ids.length > 0) {
            const currentClass = allClasses.find(cls => cls._id === ids[0]);

            if (currentClass) {
                const currentCombined: CombinedClass = currentClass as CombinedClass;

                // console.log("Current Combined: ", currentCombined);

                setCurrentClass(currentCombined);

                // Update the selected row index
                const rowIndex = classIds.findIndex(id => id === currentCombined._id);
                if (rowIndex !== -1) {
                    setSelectedRowIndex(rowIndex);
                }
            }
        }
    }

    // Add conditional rendering
    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-lg font-medium text-gray-700">Loading classes sheet...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grow overflow-auto max-h-[80vh]">
            <Spreadsheet
                data={pendingData}
                onChange={handleSpreadsheetChange}
                onKeyDown={handleKeyDown}
                onSelect={handleSelection}
                className="w-full"
            />
        </div>
    );
}