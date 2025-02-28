'use client';

import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import { useState } from "react";
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const ExportSheet = () => {
    const { allClasses } = useCalendarContext();
    const [filename, setFilename] = useState('schedule');

    const exportToXLSX = () => {
        const wsData = allClasses.map(classItem => ({
            'Course Subject': classItem.classData.course_subject,
            'Course Number': classItem.classData.course_num,
            'Catalog Number': classItem.classData.catalog_num || '',
            'Title': classItem.classData.title,
            'Instructor': classItem.classProperties.instructor_name,
            'Instructor Email': classItem.classProperties.instructor_email || '',
            'Room': classItem.classProperties.room,
            'Location': classItem.classData.location,
            'Days': classItem.classProperties.days.join(', '),
            'Start Time': classItem.classProperties.start_time,
            'End Time': classItem.classProperties.end_time,
        }));

        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Schedule");
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("Class Schedule", 14, 15);

        const tableData = allClasses.map(classItem => [
            classItem.classData.course_subject,
            classItem.classData.course_num,
            classItem.classData.catalog_num || '',
            classItem.classData.title,
            classItem.classProperties.instructor_name,
            classItem.classProperties.instructor_email || '',
            classItem.classProperties.room,
            classItem.classData.location,
            classItem.classProperties.days.join(', '),
            `${classItem.classProperties.start_time} - ${classItem.classProperties.end_time}`
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
        <div className="p-6 max-w-2xl mx-auto">
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
                    Export to Excel
                </button>
                <button
                    onClick={exportToPDF}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                    Export to PDF
                </button>
            </div>
        </div>
    );
};

export default ExportSheet;