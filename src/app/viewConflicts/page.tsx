'use client';

import { CiCircleCheck } from "react-icons/ci";
import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import DropDown from "@/components/DropDown/DropDown";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { useEffect, useState } from "react";
import { ConflictType } from "@/lib/types";

const ViewConflicts = () => {
    const { conflicts, displayClasses } = useCalendarContext();
    const [isLoading, setIsLoading] = useState(true);
    const [visibleConflicts, setVisibleConflicts] = useState<ConflictType[]>([]);
    const [hiddenConflicts, setHiddenConflicts] = useState<ConflictType[]>([]);

    useEffect(() => {
        const loadConflicts = async () => {
            // await detectConflicts();
            setIsLoading(false);
        };
        loadConflicts();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Filter conflicts whenever the list of conflicts or visible classes changes
    useEffect(() => {
        if (conflicts.length && displayClasses) {
            // Get IDs of visible classes for quick lookup
            const visibleClassIds = new Set(displayClasses.map(cls => cls._id));

            // Filter conflicts into two categories
            const visible = conflicts.filter(conflict =>
                visibleClassIds.has(conflict.class1._id) || visibleClassIds.has(conflict.class2._id)
            );

            const hidden = conflicts.filter(conflict =>
                !visibleClassIds.has(conflict.class1._id) && !visibleClassIds.has(conflict.class2._id)
            );

            setVisibleConflicts(visible);
            setHiddenConflicts(hidden);
        } else {
            setVisibleConflicts([]);
            setHiddenConflicts([]);
        }
    }, [conflicts, displayClasses]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="text-center text-gray-400 flex flex-row items-center gap-1">
                    <p>Checking for conflicts...</p>
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

    // Helper function to render a conflict list
    const renderConflictsList = (conflictsList: ConflictType[], title: string, alwaysOpen?: boolean, defaultOpen?: boolean) => {
        if (conflictsList.length === 0) {
            return null;
        }

        return (
            <div className="mb-6">
                <DropDown
                    buttonClassName="w-full"
                    renderButton={(isOpen) => (
                        <div className={`flex justify-between items-center p-2 bg-gray-100 hover:bg-gray-50 rounded-sm cursor-pointer`}>
                            <span className="text-gray-800 font-semibold">{title}</span>
                            <div className="flex items-center">
                                <span className="mr-2 text-sm font-medium">{conflictsList.length} conflicts</span>
                                {isOpen ? <MdExpandLess /> : <MdExpandMore />}
                            </div>
                        </div>
                    )}
                    dropdownClassName="w-full mt-1"
                    renderDropdown={() => (
                        <ul className="flex flex-col gap-3">
                            {conflictsList.map((conflict, index) => {
                                // Determine background and text colors based on conflict type
                                let bgColor = "bg-red-100 hover:bg-red-50";
                                let textColor = "text-red-800";
                                let conflictLabel = "Room + Instructor + Cohort";

                                if (conflict.conflictType === "room + instructor") {
                                    bgColor = "bg-orange-100 hover:bg-orange-50";
                                    textColor = "text-orange-800";
                                    conflictLabel = "Room + Instructor";
                                } else if (conflict.conflictType === "room + cohort") {
                                    bgColor = "bg-orange-100 hover:bg-orange-50";
                                    textColor = "text-orange-800";
                                    conflictLabel = "Room + Cohort";
                                } else if (conflict.conflictType === "instructor + cohort") {
                                    bgColor = "bg-orange-100 hover:bg-orange-50";
                                    textColor = "text-orange-800";
                                    conflictLabel = "Instructor + Cohort";
                                } else if (conflict.conflictType === "room") {
                                    bgColor = "bg-amber-100 hover:bg-amber-50";
                                    textColor = "text-amber-800";
                                    conflictLabel = "Room";
                                } else if (conflict.conflictType === "instructor") {
                                    bgColor = "bg-amber-100 hover:bg-amber-50";
                                    textColor = "text-amber-800";
                                    conflictLabel = "Instructor";
                                } else if (conflict.conflictType === "cohort") {
                                    bgColor = "bg-amber-100 hover:bg-amber-50";
                                    textColor = "text-amber-800";
                                    conflictLabel = "Cohort";
                                }

                                return (
                                    <li key={`${title}-conflict-${index}`}>
                                        <DropDown
                                            buttonClassName="w-full"
                                            renderButton={(isOpen) => (
                                                <div className={`flex justify-between items-center p-2 ${bgColor} rounded-sm cursor-pointer`}>
                                                    <span className={textColor}>
                                                        {conflict.class1.data.title} ⚡ {conflict.class2.data.title}
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
                                                            <p>Email: {conflict.class1.properties.instructor_email}</p>
                                                            <p>Room: {conflict.class1.properties.room}</p>
                                                            <p>Cohort: {conflict.class1.properties.cohort}</p>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h3 className="font-semibold">{conflict.class2.data.title}</h3>
                                                            <p>Days: {conflict.class2.properties.days.join(", ")}</p>
                                                            <p>Time: {conflict.class2.properties.start_time} - {conflict.class2.properties.end_time}</p>
                                                            <p>Instructor: {conflict.class2.properties.instructor_name}</p>
                                                            <p>Email: {conflict.class2.properties.instructor_email}</p>
                                                            <p>Room: {conflict.class2.properties.room}</p>
                                                            <p>Cohort: {conflict.class2.properties.cohort}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    alwaysOpen={alwaysOpen}
                    defaultOpen={defaultOpen}
                />
            </div>
        );
    };

    return (
        <div className="flex flex-col w-full h-full p-4 min-h-130">
            <h2 className="text-lg font-semibold mb-4 text-red-600">
                Found {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}
            </h2>

            {renderConflictsList(visibleConflicts, "Conflicts in Visible Classes", true, true)}
            {renderConflictsList(hiddenConflicts, "Conflicts in Hidden Classes")}

            {visibleConflicts.length === 0 && hiddenConflicts.length === 0 && (
                <div className="text-gray-500 text-center mt-4">
                    No conflicts to display. Try adjusting your filters.
                </div>
            )}
        </div>
    );
};

export default ViewConflicts;