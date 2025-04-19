import { ClassProperty, CombinedClass } from "@/lib/types";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { useEffect, useState } from "react";

const ConflictProperties = () => {
    const { currentCombinedClass, conflicts } = useCalendarContext();

    return (
        <div className="h-full w-full flex flex-col">
            <div className="w-full text-left py-2 font-bold text-gray-700">Class Conflicts</div>
            <div className="h-full">
                {currentCombinedClass?._id ?
                    (conflicts && conflicts.length > 0 && (
                        <ul className="space-y-2 flex flex-col ">
                            {conflicts.filter(conflict =>
                                conflict.class1._id === currentCombinedClass._id || conflict.class2._id === currentCombinedClass._id
                            ).map((conflict, index) => {
                                // Find the conflicting class ID (the one that's not the current class)
                                const conflictingClass = conflict.class1._id === currentCombinedClass._id
                                    ? conflict.class2.data.course_subject + " " + conflict.class2.data.course_num
                                    : conflict.class1.data.course_subject + " " + conflict.class1.data.course_num;

                                return (
                                    <li key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                                        <span className="font-medium">Conflict with class: {conflictingClass}</span>
                                        <p className="capitalize text-sm text-red-600 pt-1">
                                            {conflict.conflictType}
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>
                    )) : (
                        <div className="flex items-center justify-center text-center h-full text-gray-400 pb-8">
                            <p>Select a class to view</p>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default ConflictProperties;