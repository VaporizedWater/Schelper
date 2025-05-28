import { useMemo } from "react";
import { useCalendarContext } from "../CalendarContext/CalendarContext";

const ConflictProperties = () => {
    const { currentCombinedClass, conflicts } = useCalendarContext();

    const conflictFilterMapThing = useMemo(() => {
        return conflicts.filter(conflict =>
            conflict.class1._id === currentCombinedClass?._id || conflict.class2._id === currentCombinedClass?._id
        ).map((conflict, index) => {
            // Find the conflicting class ID (the one that's not the current class)
            const conflictingClass = conflict.class1._id === currentCombinedClass?._id
                ? conflict.class2.data.course_subject + " " + conflict.class2.data.course_num
                : conflict.class1.data.course_subject + " " + conflict.class1.data.course_num;

            return (
                <li key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <span className="font-medium dark:text-gray-200">Conflict with class: {conflictingClass}</span>
                    <p className="capitalize text-sm text-red-600 dark:text-red-400 pt-1">
                        {conflict.conflictType}
                    </p>
                </li>
            );
        })
    }, [currentCombinedClass, conflicts]);

    return (
        <div className="h-full w-full flex flex-col">
            <div className="w-full text-left py-2 font-bold text-gray-700 dark:text-gray-300">Class Conflicts</div>
            <div className="h-full">
                {currentCombinedClass?._id ?
                    (conflicts && conflicts.length > 0 && (
                        <ul className="space-y-2 flex flex-col">
                            {conflictFilterMapThing}
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