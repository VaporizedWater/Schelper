'use client';

import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import { ClassData, ClassProperty, CombinedClass } from "@/lib/types";

type AllowedKeys =
    | keyof Pick<ClassData, 'course_subject' | 'course_num' | 'catalog_num' | 'title'>
    | keyof Pick<ClassProperty, 'instructor_name' | 'instructor_email' | 'room' | 'days' | 'start_time' | 'end_time'>;

type Column = {
    key: AllowedKeys;
    label: string;
    filters: string[];
};

const COLUMNS: Column[] = [
    { key: 'course_subject',    label: 'Subject',       filters: [] },
    { key: 'course_num',        label: 'Number',        filters: [] },
    { key: 'catalog_num',       label: 'Catalog',       filters: [] },
    { key: 'title',             label: 'Title',         filters: [] },
    { key: 'instructor_name',   label: 'Instructor',    filters: [] },
    { key: 'instructor_email',  label: 'Email',         filters: [] },
    { key: 'room',              label: 'Room',          filters: [] },
    { key: 'days',              label: 'Days',          filters: [] },
    { key: 'start_time',        label: 'Start',         filters: [] },
    { key: 'end_time',          label: 'End',           filters: [] },
];

const ExportSheet = () => {
    const { allClasses, displayClasses } = useCalendarContext();


    return (
        <div className="p-4 bg-white dark:bg-white text-black dark:text-black">
            <div className="flex flex-col">
                
                <h1 className="text-2xl font-bold mb-4">Export Sheet</h1>

                <div className="flex gap-4">
                    <button
                        onClick={() => {}}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >Export to Excel ({displayClasses.length})
                    </button>
                    <button
                        onClick={() => {}}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                        >Export to PDF ({displayClasses.length})
                    </button>
                </div>
                <div className="overflow-auto max-h-[60vh] border rounded-md">
                    <table className="min-w-full border border-gray-300">
                        <thead>
                            <tr>
                                {COLUMNS.map((column) => (
                                    <th key={column.key} className="border-b px-2 py-2 text-left text-sm font-medium text-gray-700">
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {displayClasses.map((cls) => (
                                <tr key={cls._id} className="">
                                    {COLUMNS.map((column) => (
                                        <td key={column.key} className="border-b px-1 py-s text-sm text-gray-600">
                                            {cls.data[column.key as keyof ClassData]}
                                            {Array.isArray(cls.properties[column.key as keyof ClassProperty])
                                                ? (cls.properties[column.key as keyof ClassProperty] as any[]).join(', ')
                                                : cls.properties[column.key as keyof ClassProperty]?.toString()}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


export default ExportSheet;