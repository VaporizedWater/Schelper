import { newDefaultEmptyClass } from "@/lib/common";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { useCallback } from "react";
import { useToast } from "../Toast/Toast";

const DeleteClass = () => {
    const { currentCombinedClass, deleteClass, setCurrentClass } = useCalendarContext();
    const { toast } = useToast();

    const handleDeleteClass = useCallback(() => {
        if (!currentCombinedClass || !currentCombinedClass._id) return;

        // Confirmation dialog
        const isConfirmed = confirm(
            `Are you sure you want to delete ${currentCombinedClass.data.course_subject} ${currentCombinedClass.data.course_num}?\n\nThis action cannot be undone.`
        );

        if (isConfirmed) {
            try {
                deleteClass(currentCombinedClass._id);
                // Clear current class selection
                setCurrentClass(newDefaultEmptyClass());
            } catch (error) {
                toast({ description: "Failed to delete class. Please try again.", variant: 'error' });
                console.error("Error deleting class:", error);
            }
        }
    }, [currentCombinedClass, deleteClass, setCurrentClass]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            id="delete-class-panel"
            role="region"
            aria-labelledby="delete-class-title"
            className="w-full h-full flex flex-col"
        >
            <div
                id="delete-class-title"
                className="w-full text-left py-2 font-bold text-gray-700 dark:text-gray-300"
            >
                Delete Class
            </div>

            <div className="h-full">
                {currentCombinedClass && currentCombinedClass._id ? (
                    <ul role="list" aria-label="Delete class action" className="flex items-center justify-center">
                        <li role="listitem">
                            <button
                                type="button"
                                onClick={handleDeleteClass}
                                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors cursor-pointer"
                                aria-label={`Delete class ${currentCombinedClass.data.course_subject} ${currentCombinedClass.data.course_num}`}
                            >
                                Delete Class
                            </button>
                        </li>
                    </ul>
                ) : (
                    <div
                        role="alert"
                        className="flex items-center justify-center text-center h-full text-gray-400 pb-8"
                    >
                        <p>Select a class to delete</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeleteClass;
