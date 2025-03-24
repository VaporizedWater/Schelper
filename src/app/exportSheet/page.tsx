'use client';

import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import { useState, useCallback } from "react";
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { CombinedClass } from "@/lib/types";

const ExportSheet = () => {
    const { allClasses } = useCalendarContext();
    const [filename, setFilename] = useState('schedule');

    // Create a unique identifier for each class
    const getUniqueClassId = useCallback((cls: CombinedClass): string => {
        return `${cls.data.class_num || ''}-${cls.data.section || ''}-${cls.properties.room}-${cls.properties.instructor_name}-${cls.properties.days.join(',')}-${cls.properties.start_time}`;
    }, []);

    const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set(allClasses.map(c => getUniqueClassId(c))));


    const exportToXLSX = () => {
        // Filter classes based on selection
        const classesToExport = allClasses.filter(cls => selectedClasses.has(getUniqueClassId(cls)));

        const wsData = classesToExport.map(classItem => ({
            'Course Subject': classItem.data.course_subject,
            'Course Number': classItem.data.course_num,
            'Catalog Number': classItem.data.catalog_num || '',
            'Title': classItem.data.title,
            'Instructor': classItem.properties.instructor_name,
            'Instructor Email': classItem.properties.instructor_email || '',
            'Room': classItem.properties.room,
            'Location': classItem.data.location,
            'Days': classItem.properties.days.join(', '),
            'Start Time': classItem.properties.start_time,
            'End Time': classItem.properties.end_time,
        }));

        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Schedule");
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportToPDF = () => {
        // Filter classes based on selection
        const classesToExport = allClasses.filter(cls => selectedClasses.has(getUniqueClassId(cls)));

        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("Class Schedule", 14, 15);

        const tableData = classesToExport.map(classItem => [
            classItem.data.course_subject,
            classItem.data.course_num,
            classItem.data.catalog_num || '',
            classItem.data.title,
            classItem.properties.instructor_name,
            classItem.properties.instructor_email || '',
            classItem.properties.room,
            classItem.data.location,
            classItem.properties.days.join(', '),
            `${classItem.properties.start_time} - ${classItem.properties.end_time}`
        ]);

        autoTable(doc, {
            head: [['Subject', 'Number', 'Catalog', 'Title', 'Instructor', 'Email', 'Room', 'Location', 'Days', 'Time']],
            body: tableData,
            startY: 20,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`${filename}.pdf`);
    };

    return (
        <div className="p-4">
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
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
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
                                    <th className="p-2 border text-left">Catalog</th>
                                    <th className="p-2 border text-left">Title</th>
                                    <th className="p-2 border text-left">Instructor</th>
                                    <th className="p-2 border text-left">Email</th>
                                    <th className="p-2 border text-left">Room</th>
                                    <th className="p-2 border text-left">Location</th>
                                    <th className="p-2 border text-left">Days</th>
                                    <th className="p-2 border text-left">Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {allClasses.map((classItem, index) => {
                                    const uniqueId = getUniqueClassId(classItem);
                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
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
                                            <td className="p-2 border">{classItem.data.catalog_num || ''}</td>
                                            <td className="p-2 border">{classItem.data.title}</td>
                                            <td className="p-2 border">{classItem.properties.instructor_name}</td>
                                            <td className="p-2 border">{classItem.properties.instructor_email || ''}</td>
                                            <td className="p-2 border">{classItem.properties.room}</td>
                                            <td className="p-2 border">{classItem.data.location}</td>
                                            <td className="p-2 border">{classItem.properties.days.join(', ')}</td>
                                            <td className="p-2 border">
                                                {classItem.properties.start_time} - {classItem.properties.end_time}
                                            </td>
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