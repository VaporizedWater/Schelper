"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { CombinedClass } from "@/lib/types";

export default function CalendarSheet() {
    const { displayClasses, allClasses, setCurrentClass, currentCombinedClass, isLoading } = useCalendarContext();
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

    // Update selected row when currentClass changes
    useEffect(() => {
        if (currentCombinedClass) {
            const rowIndex = displayClasses.findIndex(cls => cls._id === currentCombinedClass._id);
            if (rowIndex !== -1) {
                setSelectedRowIndex(rowIndex);
            }
        }
    }, [currentCombinedClass, displayClasses]);

    // Handle row selection
    const handleRowClick = useCallback((item: CombinedClass, index: number) => {
        setCurrentClass(item);
        setSelectedRowIndex(index);
    }, [setCurrentClass]);

    const calendarSheet = useMemo(() => {
        return (
            <div className="grow overflow-auto max-h-[80vh]">
                <table className="w-full border-collapse min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-zinc-800 sticky top-0 z-10">
                        <tr>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-zinc-800 z-20">#</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Catalog #</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Class #</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Session</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course #</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Section</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-40">Title</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Start</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Facility</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Room</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Days</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Instructor</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Enroll Cap</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Wait Cap</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cohort</th>
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tags</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                        {displayClasses.map((item, index) => (
                            <tr
                                key={item._id}
                                className={`${index === selectedRowIndex || item._id === currentCombinedClass?._id ? 'bg-blue-200 dark:bg-blue-900 hover:bg-blue-300 dark:hover:bg-blue-800' : ((index % 2 === 0 ? 'bg-white dark:bg-zinc-800' : 'bg-gray-50 dark:bg-zinc-700') + ' hover:bg-gray-100 dark:hover:bg-zinc-600')
                                    }  transition-colors duration-150`}
                                onClick={() => handleRowClick(item, index)}
                                style={{ cursor: 'pointer' }}
                                role="row"
                                aria-selected={index === selectedRowIndex}
                            >
                                <td className="p-2 text-xs font-medium text-gray-500 dark:text-gray-400 sticky left-0 bg-inherit">{index + 1}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.data.catalog_num}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.data.class_num}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.data.session}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.data.course_subject}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.data.course_num}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.data.section}</td>
                                <td className="p-2 dark:text-gray-300">{item.data.title}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.properties.class_status}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.properties.start_time}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.properties.end_time}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.properties.facility_id}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.properties.room}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.properties.days?.join(', ')}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.properties.instructor_name}</td>
                                <td className="p-2 dark:text-gray-300">{item.properties.instructor_email}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.data.enrollment_cap}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.data.waitlist_cap}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.properties.cohort}</td>
                                <td className="p-2 whitespace-nowrap dark:text-gray-300">{item.properties.tags?.filter(tag => tag.tagCategory === "user").map(tag => tag.tagName).join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }, [allClasses, currentCombinedClass]); // eslint-disable-line react-hooks/exhaustive-deps

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-white dark:bg-dark bg-opacity-80 dark:bg-opacity-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-400">Loading classes sheet...</p>
                </div>
            </div>
        );
    }

    return (calendarSheet);
}