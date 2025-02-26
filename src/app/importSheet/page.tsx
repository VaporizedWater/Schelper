"use client";

import { useCalendarContext } from '@/components/CalendarContext/CalendarContext';
import { newDefaultEmptyClass } from '@/lib/common';
import { CombinedClass } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import xlsx from 'xlsx';

const convertTime = (excelTimeString: string) => {
    const timeComponents = excelTimeString.split(' ');
    const numberComponent = timeComponents[0];
    const ampm = timeComponents[1];

    if (ampm.trim().toLowerCase() === 'am') {
        return numberComponent;
    } else {
        const t = numberComponent.split(':');
        const hour = parseInt(t[0]) + 12;
        return hour + ':' + t[1];
    }
}

const ImportSheet = () => {
    const [file, setFile] = useState<File | null>(null);
    const router = useRouter();
    const { uploadNewClasses } = useCalendarContext();

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
            const combinedClass = newDefaultEmptyClass();

            const classData = combinedClass.classData;
            const classProperties = combinedClass.classProperties;
            let isCancelled = false;

            const cancelClassCreation = () => {
                isCancelled = true;
            };

            Object.keys(element).forEach(key => {
                const value = String(element[key as keyof typeof element]);
                if (value) {
                    if (key === "Class Stat" && value === "Cancelled Section") {
                        cancelClassCreation();
                        return;
                    }

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
                            const val = value.trim();
                            const match = val.match(/^\d+/);
                            if (match) {
                                const numbers = Number(match);
                                if (!isNaN(numbers)) {
                                    switch (Math.floor(numbers / 100)) {
                                        case 1:
                                            classProperties.tags.push("100level");
                                            break;
                                        case 2:
                                            classProperties.tags.push("200level");
                                            break;
                                        case 3:
                                            classProperties.tags.push("300level");
                                            break;
                                        case 4:
                                            classProperties.tags.push("400level");
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }
                            classData.course_num = val;
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
                            console.log("start time");
                            console.log(value + ", converted: " + convertTime(value));
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
                            if (value.trim() === "" || value === undefined) {
                                break;
                            }
                            classProperties.days.push("Mon");
                            break;
                        case "T":
                            if (value.trim() === "" || value === undefined) {
                                break;
                            }
                            classProperties.days.push("Tue");
                            break;
                        case "W":
                            if (value.trim() === "" || value === undefined) {
                                break;
                            }
                            classProperties.days.push("Wed");
                            break;
                        case "R":
                            if (value.trim() === "" || value === undefined) {
                                break;
                            }
                            classProperties.days.push("Thu");
                            break;
                        case "F":
                            if (value.trim() === "" || value === undefined) {
                                break;
                            }
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

            if (!isCancelled) {
                combinedClasses.push(combinedClass);
            }
        });

        uploadNewClasses(combinedClasses);

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