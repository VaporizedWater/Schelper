"use client";

import { useCalendarContext } from '@/components/CalendarContext/CalendarContext';
import { Class, ClassProperty, CombinedClass } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { title } from 'process';
import { useState } from 'react';
import xlsx from 'xlsx';

const convertTime = (excelTimeString: string) => {
    const timeComponents = excelTimeString.split(' ');
    const numberComponent = timeComponents[0];
    const ampm = timeComponents[1];

    if (ampm.toLowerCase() === 'am') {
        return numberComponent;
    } else {
        let t = numberComponent.split(':');
        let hour = parseInt(t[0]);
        let minute = parseInt(t[1]);
        hour += 12;
        return hour + ':' + minute;
    }
}

const ImportSheet = () => {
    const [file, setFile] = useState<File | null>(null);
    const router = useRouter();
    const { allClasses, updateAllClasses, updateDisplayClasses, updateDisplayEvents, updateAllEvents } = useCalendarContext();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!file) return;

        const data = await file.arrayBuffer();

        // Parse the data into a workbook
        const workbook = xlsx.read(data, { type: 'array' });

        // Select the first sheet in the workbook
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert the sheet to an array of arrays (each sub-array represents a row)
        const rows = xlsx.utils.sheet_to_json(worksheet, { range: 1 }) as object[][];

        const combinedClasses = [] as CombinedClass[];

        rows.values().forEach((element: object[]) => {
            const classData = {
                _id: ''
            } as Class;
            const classProperties = {
                days: [] as string[]
            } as ClassProperty;

            Object.keys(element).forEach(key => {
                const value = String(element[key as keyof typeof element]);
                if (value) {
                    switch (key) {
                        // Class
                        case "Catalog #":
                            classData.catalog_num = value;
                            break;
                        case "Class #":
                            classData.class_num = value;
                            break;
                        case "Session":
                            classData.session = value;
                            break;
                        case "Course":
                            classData.course_subject = value;
                            break;
                        case "Num":
                            classData.course_num = value.trim();
                            break;
                        case "Section":
                            classData.section = value;
                            break;
                        case "Title":
                            classData.title = value;
                            break;
                        case "Location":
                            classData.location = value;
                            break;
                        case "Enr Cpcty":
                            classData.enrollment_cap = value;
                            break;
                        case "Wait Cap":
                            classData.waitlist_cap = value;
                            break;

                        // Class Property
                        case "Class Stat":
                            classProperties.class_status = value;
                            break;
                        case "Start":
                            classProperties.start_time = convertTime(value);
                            break;
                        case "End":
                            classProperties.end_time = convertTime(value);
                            break;
                        case "Room":
                            classProperties.room = value;
                            break;
                        case "Facility ID":
                            classProperties.facility_id = value;
                            break;
                        case "M":
                            classProperties.days.push("Mon");
                            break;
                        case "T":
                            classProperties.days.push("Tue");
                            break;
                        case "W":
                            classProperties.days.push("Wed");
                            break;
                        case "R":
                            classProperties.days.push("Thu");
                            break;
                        case "F":
                            classProperties.days.push("Fri");
                            break;
                        case "Instructor Email":
                            classProperties.instructor_email = value;
                            break;
                        case "Instructor Name":
                            classProperties.instructor_name = value;
                            break;
                        case "Tot Enrl":
                            classProperties.total_enrolled = value;
                            break;
                        case "Wait Tot":
                            classProperties.total_waitlisted = value;
                            break;
                        default:
                            break;
                    }
                }
            });

            const combinedClass = {
                classData: classData,
                classProperties: classProperties
            } as CombinedClass;
            combinedClasses.push(combinedClass);
        });

        updateAllClasses(combinedClasses);

        router.back();
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Import Sheet</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className='max-h-fit'>
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!file}
                    className="px-4 py-2 bg-blue-500 text-white rounded
                        hover:bg-blue-600 disabled:bg-gray-300"
                >
                    Import
                </button>
            </form>
        </div>
    );
};

export default ImportSheet;