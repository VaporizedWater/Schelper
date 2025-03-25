'use client';

import { CiCircleCheck } from "react-icons/ci";
import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import DropDown from "@/components/DropDown/DropDown";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { useEffect, useState } from "react";
// import { ConflictType } from "@/lib/types";


const ViewConflicts = () => {
    const { detectConflicts, conflicts } = useCalendarContext();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadConflicts = async () => {
            await detectConflicts();
            setIsLoading(false);
        };
        loadConflicts();
    }); // because useReducer is the same as a complex useState, calling detectConflicts() 
    // while also depending on detectConflicts in an async function will cause the calendar
    // behind the modal to re-render in an infinite loop, which will spam the console with 
    // errors and slow down the browser, with enough delay that it doesn't outright crash.
    // By removing all dependencies, useEffect will only run once. - THANKS, `JAMES`!

    // console.log(JSON.stringify(conflicts));

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="text-center text-gray-400 flex flex-row items-center gap-1">
                    <p>Checking for conflicts...</p>
                    {/* add a spinner here*/}
                </div>
            </div>
        );
    }

    if (conflicts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="text-center text-gray-400 flex flex-row items-center gap-1">
                    <p>No Conflicts Yet</p>
                    <CiCircleCheck />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full p-4">
            <h2 className="text-lg font-semibold mb-4 text-red-600">
                Found {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}
            </h2>
            <ul className="flex flex-col gap-3">
                {conflicts.map((conflict, index) => {
                    // Determine background and text colors based on conflict type
                    let bgColor = "bg-red-100 hover:bg-red-50";
                    let textColor = "text-red-800";
                    let conflictLabel = "Room + Instructor";

                    if (conflict.conflictType === "room") {
                        bgColor = "bg-amber-100 hover:bg-amber-50";
                        textColor = "text-amber-800";
                        conflictLabel = "Room";
                    } else if (conflict.conflictType === "instructor") {
                        bgColor = "bg-orange-100 hover:bg-orange-50";
                        textColor = "text-orange-800";
                        conflictLabel = "Instructor";
                    }

                    return (
                        <li key={`conflict-${index}`}>
                            <DropDown
                                buttonClassName="w-full"
                                renderButton={(isOpen) => (
                                    <div className={`flex justify-between items-center p-2 ${bgColor} rounded-sm cursor-pointer`}>
                                        <span className={textColor}>
                                            Conflict {index + 1}: {conflict.class1.data.title} ⚡ {conflict.class2.data.title}
                                        </span>
                                        <div className="flex items-center">
                                            <span className="mr-2 text-sm font-medium">{conflictLabel}</span>
                                            {isOpen ? <MdExpandLess /> : <MdExpandMore />}
                                        </div>
                                    </div>
                                )}
                                dropdownClassName="w-full mt-1"
                                renderDropdown={() => (
                                    <div className="bg-white border rounded-sm shadow-lg p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <h3 className="font-semibold">{conflict.class1.data.title}</h3>
                                                <p>Days: {conflict.class1.properties.days.join(", ")}</p>
                                                <p>Time: {conflict.class1.properties.start_time} - {conflict.class1.properties.end_time}</p>
                                                <p>Instructor: {conflict.class1.properties.instructor_name}</p>
                                                <p>Room: {conflict.class1.properties.room}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="font-semibold">{conflict.class2.data.title}</h3>
                                                <p>Days: {conflict.class2.properties.days.join(", ")}</p>
                                                <p>Time: {conflict.class2.properties.start_time} - {conflict.class2.properties.end_time}</p>
                                                <p>Instructor: {conflict.class2.properties.instructor_name}</p>
                                                <p>Room: {conflict.class2.properties.room}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default ViewConflicts;