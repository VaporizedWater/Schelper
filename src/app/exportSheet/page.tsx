'use client';

import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import { useState, useCallback, useMemo } from "react";
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { CombinedClass } from "@/lib/types";

const ExportSheet = () => {
    const { allClasses, conflicts } = useCalendarContext();
    const [filename, setFilename] = useState('schedule');

    allClasses.sort((a, b) => {
        // Sort by course subject, then course number, then section
        if (a.data.course_subject < b.data.course_subject) return -1;
        if (a.data.course_subject > b.data.course_subject) return 1;
        if (a.data.course_num < b.data.course_num) return -1;
        if (a.data.course_num > b.data.course_num) return 1;
        if (a.data.section < b.data.section) return -1;
        if (a.data.section > b.data.section) return 1;
        return 0; // Equal
    });

    // Create a unique identifier for each class
    const getUniqueClassId = useCallback((cls: CombinedClass): string => {
        return `${cls.data.class_num || ''}-${cls.data.section || ''}-${cls.properties.room}-${cls.properties.instructor_name}-${cls.properties.days.join(',')}-${cls.properties.start_time}`;
    }, []);

    const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set(allClasses.map(c => getUniqueClassId(c))));

    // Get conflict color information for each class (used for UI only)
    const classConflictColors = useMemo(() => {
        const conflictMap = new Map<string, { color: string, textColor: string, conflictType: string, conflictLabel: string }>();

        allClasses.forEach(cls => {
            // Find conflicts involving this class
            const classConflicts = conflicts.filter(conflict =>
                conflict.class1._id === cls._id ||
                conflict.class2._id === cls._id
            );

            // Default is no conflict
            let color = 'transparent';
            let textColor = 'inherit';
            let conflictType = '';
            let conflictLabel = '';

            if (classConflicts.length > 0) {
                // Determine most severe conflict type (both > room > instructor)
                const hasBothConflict = classConflicts.some(c => c.conflictType === "both");
                const hasRoomConflict = classConflicts.some(c => c.conflictType === "room");
                const hasInstructorConflict = classConflicts.some(c => c.conflictType === "instructor");

                if (hasBothConflict) {
                    color = '#FF0000'; // Red for both conflicts
                    textColor = 'white';
                    conflictType = 'both';
                    conflictLabel = 'Room + Instructor';
                } else if (hasRoomConflict) {
                    color = '#f59e0b'; // Amber for room conflicts
                    textColor = 'white';
                    conflictType = 'room';
                    conflictLabel = 'Room';
                } else if (hasInstructorConflict) {
                    color = '#f97316'; // Orange for instructor conflicts
                    textColor = 'white';
                    conflictType = 'instructor';
                    conflictLabel = 'Instructor';
                }
            }

            conflictMap.set(cls._id, { color, textColor, conflictType, conflictLabel });
        });

        return conflictMap;
    }, [allClasses, conflicts]);

    const exportToXLSX = useCallback(() => {
        // Filter classes based on selection
        const classesToExport = allClasses.filter(cls => selectedClasses.has(getUniqueClassId(cls)));

        const wsData = classesToExport.map(classItem => {
            return {
                'Course Subject': classItem.data.course_subject,
                'Course Number': classItem.data.course_num,
                'Section': classItem.data.section,
                'Title': classItem.data.title,
                'Instructor': classItem.properties.instructor_name,
                'Instructor Email': classItem.properties.instructor_email || '',
                'Start Time': classItem.properties.start_time,
                'End Time': classItem.properties.end_time,
                'Days': classItem.properties.days.join(', '),
                'Room': classItem.properties.room,
                'Class': classItem.data.class_num || ''
            };
        });

        // Create the workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(wsData);

        // Get the range of the worksheet
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:L1');
        const lastCol = XLSX.utils.encode_col(range.e.c);

        // Add auto filter
        ws['!autofilter'] = { ref: `A1:${lastCol}${range.e.r + 1}` };

        // Remove color formatting from export

        XLSX.utils.book_append_sheet(wb, ws, "Schedule");
        XLSX.writeFile(wb, `${filename}.xlsx`);
    }, [allClasses, filename, getUniqueClassId, selectedClasses]);

    const exportToPDF = useCallback(() => {
        // Filter classes based on selection
        const classesToExport = allClasses.filter(cls => selectedClasses.has(getUniqueClassId(cls)));

        // Use landscape orientation for more width
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        doc.setFontSize(16);
        doc.text("Class Schedule", 14, 15);

        const tableData = classesToExport.map(classItem => {
            return [
                classItem.data.course_subject,
                classItem.data.course_num,
                classItem.data.section,
                classItem.data.title,
                classItem.properties.instructor_name,
                classItem.properties.instructor_email || '',
                classItem.properties.start_time,
                classItem.properties.end_time,
                classItem.properties.days.join(', '),
                classItem.properties.room,
                classItem.data.class_num || '',
            ];
        });

        // Optimize column widths based on content type
        autoTable(doc, {
            head: [['Subject', 'Number', 'Section', 'Title', 'Instructor', 'Email', 'Start', 'End', 'Days', 'Room', 'Class Num']],
            body: tableData,
            startY: 20,
            styles: {
                fontSize: 7,
                cellPadding: 2,
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: [41, 128, 185],
                fontSize: 8,
                halign: 'center',
                valign: 'middle',
                lineWidth: 0.25
            },
            columnStyles: {
                0: { cellWidth: 15 },    // Subject
                1: { cellWidth: 15 },    // Number
                2: { cellWidth: 15 },    // Section
                3: { cellWidth: 35 },    // Title
                4: { cellWidth: 35 },    // Instructor
                5: { cellWidth: 30 },    // Email
                6: { cellWidth: 12 },    // Start
                7: { cellWidth: 12 },    // End
                8: { cellWidth: 25 },    // Days
                9: { cellWidth: 35 },    // Room
                10: { cellWidth: 15 },    // Class Num 
            },
            margin: { top: 25 }
        });

        doc.save(`${filename}.pdf`);
    }, [allClasses, filename, getUniqueClassId, selectedClasses]);

    return (
        <div className="p-4 min-h-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1 dark:text-gray-200">Export Schedule</h1>
                <span className="text-lg text-gray-600 dark:text-gray-400 font-medium">Spring 2025</span>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    File Name
                </label>
                <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="w-full p-2 border rounded-md dark:border-zinc-500 dark:bg-zinc-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="Enter file name"
                />
            </div>

            <div className="flex gap-4">
                <button
                    onClick={exportToXLSX}
                    className="bg-blue-500 dark:bg-blue-600 dark:text-gray-100 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-500"
                >
                    Export to Excel ({selectedClasses.size})
                </button>
                <button
                    onClick={exportToPDF}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 dark:hover:bg-red-500 dark:bg-red-600 dark:text-gray-100"
                >
                    Export to PDF ({selectedClasses.size})
                </button>
            </div>

            {/* Preview of classes to be exported */}
            {allClasses.length > 0 && (
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-semibold">Classes to Export ({selectedClasses.size})</h2>
                    </div>
                    <div className="overflow-auto max-h-[60vh] border dark:bg-zinc-500 dark:border-zinc-500 rounded-md">
                        <table className="min-w-full table-fixed border-collapse divide-y divide-gray-200 dark:divide-zinc-500">
                            <thead className="bg-gray-50 dark:bg-zinc-600 sticky top-0 dark:text-gray-300 dark:border-zinc-500">
                                <tr className="">
                                    <th className="p-2 dark:border-zinc-500 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedClasses.size === allClasses.length && allClasses.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedClasses(new Set(allClasses.map(c => getUniqueClassId(c))));
                                                } else {
                                                    setSelectedClasses(new Set());
                                                }
                                            }}
                                            className="h-4 w-4"
                                        />
                                    </th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Subject</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Number</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Section</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Title</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Instructor</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Email</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Start</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">End</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Days</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Room</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Class Num</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-700 divide-y divide-gray-200">
                                {allClasses.map((classItem, index) => {
                                    const uniqueId = getUniqueClassId(classItem);
                                    const { color, textColor } = classConflictColors.get(classItem._id) || { color: 'transparent', textColor: 'inherit' };

                                    return (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-50"
                                            style={{
                                                backgroundColor: color,
                                                color: textColor
                                            }}
                                        >
                                            <td className="p-2 border dark:border-zinc-500 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedClasses.has(uniqueId)}
                                                    onChange={(e) => {
                                                        const newSelected = new Set(selectedClasses);
                                                        if (e.target.checked) {
                                                            newSelected.add(uniqueId);
                                                        } else {
                                                            newSelected.delete(uniqueId);
                                                        }
                                                        setSelectedClasses(newSelected);
                                                    }}
                                                    className="h-4 w-4"
                                                />
                                            </td>
                                            <td className="p-2 border dark:border-zinc-500">{classItem.data.course_subject}</td>
                                            <td className="p-2 border dark:border-zinc-500">{classItem.data.course_num}</td>
                                            <td className="p-2 border dark:border-zinc-500">{classItem.data.section}</td>
                                            <td className="p-2 border dark:border-zinc-500">{classItem.data.title}</td>
                                            <td className="p-2 border dark:border-zinc-500">{classItem.properties.instructor_name}</td>
                                            <td className="p-2 border dark:border-zinc-500">{classItem.properties.instructor_email || ''}</td>
                                            <td className="p-2 border dark:border-zinc-500">{classItem.properties.start_time}</td>
                                            <td className="p-2 border dark:border-zinc-500">{classItem.properties.end_time}</td>
                                            <td className="p-2 border dark:border-zinc-500">{classItem.properties.days.join(', ')}</td>
                                            <td className="p-2 border dark:border-zinc-500">{classItem.properties.room}</td>
                                            <td className="p-2 border dark:border-zinc-500">{classItem.data.class_num || ''}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {allClasses.length === 0 && (
                <div className="mt-8 p-4 bg-yellow-50 dark:bg-zinc-700 border border-yellow-200 dark:border-zinc-600 rounded-md">
                    <p className="text-yellow-700 dark:text-gray-300">No classes to export. Please add classes to your schedule first.</p>
                </div>
            )}
        </div>
    );
};

export default ExportSheet;