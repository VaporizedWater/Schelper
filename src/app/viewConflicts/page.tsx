'use client';

import { CiCircleCheck } from "react-icons/ci";
import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import DropDown from "@/components/DropDown/DropDown";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { useEffect, useState } from "react";
import { ConflictType } from "@/lib/types";


const ViewConflicts = () => {
    const { detectConflicts, conflicts } = useCalendarContext();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadConflicts = async () => {
            await detectConflicts();
            setIsLoading(false);
        };
        loadConflicts();
    }, []);

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
                {conflicts.map((conflict, index) => (
                    <li key={`conflict-${index}`}>
                        <DropDown
                            buttonClassName="w-full"
                            renderButton={(isOpen) => (
                                <div className="hover:bg-red-50 flex justify-between items-center p-2 bg-red-100 rounded cursor-pointer">
                                    <span className="text-red-800">
                                        Conflict {index + 1}: {conflict.class1.classData.title} ⚡ {conflict.class2.classData.title}
                                    </span>
                                    <div className="flex items-center">
                                        {isOpen ? <MdExpandLess /> : <MdExpandMore />}
                                    </div>
                                </div>
                            )}
                            dropdownClassName="w-full mt-1"
                            renderDropdown={() => (
                                <div className="bg-white border rounded shadow-lg p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <h3 className="font-semibold">{conflict.class1.classData.title}</h3>
                                            <p>Days: {conflict.class1.classProperties.days.join(", ")}</p>
                                            <p>Time: {conflict.class1.classProperties.start_time} - {conflict.class1.classProperties.end_time}</p>
                                            <p>Instructor: {conflict.class1.classProperties.instructor_name}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-semibold">{conflict.class2.classData.title}</h3>
                                            <p>Days: {conflict.class2.classProperties.days.join(", ")}</p>
                                            <p>Time: {conflict.class2.classProperties.start_time} - {conflict.class2.classProperties.end_time}</p>
                                            <p>Instructor: {conflict.class2.classProperties.instructor_name}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ViewConflicts;