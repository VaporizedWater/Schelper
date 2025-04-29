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
                'Class Number': classItem.data.class_num || '',
                'Title': classItem.data.title,
                'Instructor': classItem.properties.instructor_name,
                'Instructor Email': classItem.properties.instructor_email || '',
                'Room': classItem.properties.room,
                'Days': classItem.properties.days.join(', '),
                'Start Time': classItem.properties.start_time,
                'End Time': classItem.properties.end_time
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
                classItem.data.class_num || '',
                classItem.data.title,
                classItem.properties.instructor_name,
                classItem.properties.instructor_email || '',
                classItem.properties.room,
                classItem.properties.days.join(', '),
                classItem.properties.start_time,
                classItem.properties.end_time
            ];
        });

        // Optimize column widths based on content type
        autoTable(doc, {
            head: [['Subject', 'Number', 'Section', 'Class Num', 'Title', 'Instructor', 'Email', 'Room', 'Days', 'Start', 'End']],
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
                2: { cellWidth: 15 },    // Catalog
                3: { cellWidth: 35 },    // Title
                4: { cellWidth: 35 },    // Instructor
                5: { cellWidth: 30 },    // Email
                6: { cellWidth: 35 },    // Room
                8: { cellWidth: 25 },    // Days
                9: { cellWidth: 12 },    // Start
                10: { cellWidth: 12 },   // End
            },
            margin: { top: 25 }
        });

        doc.save(`${filename}.pdf`);
    }, [allClasses, filename, getUniqueClassId, selectedClasses]);

    return (
        <div className="p-4 bg-white dark:bg-white text-black dark:text-black">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1">Export Schedule</h1>
                <span className="text-lg text-gray-600 font-medium">Spring 2025</span>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Name
                </label>
                <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter file name"
                />
            </div>

            <div className="flex gap-4">
                <button
                    onClick={exportToXLSX}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                    Export to Excel ({selectedClasses.size})
                </button>
                <button
                    onClick={exportToPDF}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
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
                    <div className="overflow-auto max-h-[60vh] border rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="p-2 border text-center">
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
                                    <th className="p-2 border text-left">Subject</th>
                                    <th className="p-2 border text-left">Number</th>
                                    <th className="p-2 border text-left">Section</th>
                                    <th className="p-2 border text-left">Class Num</th>
                                    <th className="p-2 border text-left">Title</th>
                                    <th className="p-2 border text-left">Instructor</th>
                                    <th className="p-2 border text-left">Email</th>
                                    <th className="p-2 border text-left">Room</th>
                                    <th className="p-2 border text-left">Days</th>
                                    <th className="p-2 border text-left">Start</th>
                                    <th className="p-2 border text-left">End</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
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
                                            <td className="p-2 border text-center">
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
                                            <td className="p-2 border">{classItem.data.course_subject}</td>
                                            <td className="p-2 border">{classItem.data.course_num}</td>
                                            <td className="p-2 border">{classItem.data.section}</td>
                                            <td className="p-2 border">{classItem.data.class_num || ''}</td>
                                            <td className="p-2 border">{classItem.data.title}</td>
                                            <td className="p-2 border">{classItem.properties.instructor_name}</td>
                                            <td className="p-2 border">{classItem.properties.instructor_email || ''}</td>
                                            <td className="p-2 border">{classItem.properties.room}</td>
                                            <td className="p-2 border">{classItem.properties.days.join(', ')}</td>
                                            <td className="p-2 border">{classItem.properties.start_time}</td>
                                            <td className="p-2 border">{classItem.properties.end_time}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {allClasses.length === 0 && (
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-700">No classes to export. Please add classes to your schedule first.</p>
                </div>
            )}
        </div>
    );
};

export default ExportSheet;