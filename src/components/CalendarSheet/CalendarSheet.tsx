"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { CombinedClass } from "@/lib/types";

export default function CalendarSheet() {
    const { displayClasses, allClasses, setCurrentClass, currentCombinedClass, setCurrentClasses, currentCombinedClasses, isLoading } = useCalendarContext();
    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

    // Update selected row when currentClass changes
    useEffect(() => {
        if (currentCombinedClass) {
            const rowIndex = displayClasses.findIndex(cls => cls._id === currentCombinedClass._id);
            if (rowIndex !== -1) {
                setSelectedRowIndex(rowIndex);
            }
        }
    }, [currentCombinedClass, currentCombinedClasses, displayClasses]);

    // Handle row selection
    const handleRowClick = useCallback((item: CombinedClass, index: number) => {
        setCurrentClass(item);
        setCurrentClasses(item);
        setSelectedRowIndex(index);
    }, [setCurrentClass, setCurrentClasses]);

    const thClassname = 'px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider';
    const tdClassname = 'p-2 whitespace-nowrap dark:text-gray-300';


    const calendarSheet = useMemo(() => {
        return (
            <div className="overflow-scroll max-h-[80vh]">
                <table className="w-full border-collapse min-w-full text-sm" role="table" aria-label="Calendar Classes Spreadsheet" title="Calendar Classes Spreadsheet">
                    <thead className="bg-gray-50 dark:bg-zinc-800 sticky top-0">
                        <tr role="row">
                            <th className="">#</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Subject">Subject</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Course Number">Course #</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Section">Section</th>
                            <th className={thClassname + " min-w-40"} role="columnheader" scope="col" title="Title">Title</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Instructor Name">Instructor</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Instructor Email">Email</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Start Time">Start</th>
                            <th className={thClassname} role="columnheader" scope="col" title="End Time">End</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Class Days">Days</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Room">Room</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Class Number">Class #</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Cohort">Cohort</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Tags">Tags</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Catalog Number">Catalog #</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Session">Session</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Enrollment Capacity">Enroll Cap</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Waitlist Capacity">Wait Cap</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Class Status">Status</th>
                            <th className={thClassname} role="columnheader" scope="col" title="Facility ID">Facility</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                        {displayClasses.map((item, index) => (
                            <tr
                                key={item._id}
                                className={`${index === selectedRowIndex || item._id === currentCombinedClass?._id ? 'bg-blue-200 dark:bg-blue-900 hover:bg-blue-300 dark:hover:bg-blue-800'
                                    : (currentCombinedClasses.includes(item) ?
                                        'bg-indigo-100 dark:bg-blue-900/70 hover:bg-indigo-200 dark:hover:bg-blue-800/70'
                                        : ((index % 2 === 0 ? 'bg-white dark:bg-zinc-800' : 'bg-gray-50 dark:bg-zinc-700') + ' hover:bg-gray-100 dark:hover:bg-zinc-600'))
                                    }  
                                    transition-colors duration-150`
                                }
                                onClick={() => handleRowClick(item, index)}
                                style={{ cursor: 'pointer' }}
                                role="row"
                                aria-selected={index === selectedRowIndex}
                            >
                                <td className="p-2 text-xs font-medium text-gray-500 dark:text-gray-400" role="cell">{index + 1}</td>
                                <td className={tdClassname} role="cell">{item.data.course_subject}</td>
                                <td className={tdClassname} role="cell">{item.data.course_num}</td>
                                <td className={tdClassname} role="cell">{item.data.section}</td>
                                <td className="p-2 dark:text-gray-300" role="cell">{item.data.title}</td>
                                <td className={tdClassname} role="cell">{item.properties.instructor_name}</td>
                                <td className="p-2 dark:text-gray-300" role="cell">{item.properties.instructor_email}</td>
                                <td className={tdClassname} role="cell">{item.properties.start_time}</td>
                                <td className={tdClassname} role="cell">{item.properties.end_time}</td>
                                <td className={tdClassname} role="cell">{item.properties.days?.join(', ')}</td>
                                <td className={tdClassname} role="cell">{item.properties.room}</td>
                                <td className={tdClassname} role="cell">{item.data.class_num}</td>
                                <td className={tdClassname} role="cell">{item.properties.cohort}</td>
                                <td className={tdClassname} role="cell">{item.properties.tags?.filter(tag => tag.tagCategory === "user").map(tag => tag.tagName).join(', ')}</td>
                                <td className={tdClassname} role="cell">{item.data.catalog_num}</td>
                                <td className={tdClassname} role="cell">{item.data.session}</td>
                                <td className={tdClassname} role="cell">{item.data.enrollment_cap}</td>
                                <td className={tdClassname} role="cell">{item.data.waitlist_cap}</td>
                                <td className={tdClassname} role="cell">{item.properties.class_status}</td>
                                <td className={tdClassname} role="cell">{item.properties.facility_id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }, [allClasses, currentCombinedClass]); // eslint-disable-line react-hooks/exhaustive-deps

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-white dark:bg-dark bg-opacity-80 dark:bg-opacity-100" title="Loading classes sheet" aria-label="Loading classes sheet">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-400">Loading classes sheet...</p>
                </div>
            </div>
        );
    }

    return (calendarSheet);
} 