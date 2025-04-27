import { newDefaultEmptyClass } from "@/lib/common";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { useCallback } from "react";

const DeleteClass = () => {
    const { currentCombinedClass, deleteClass, setCurrentClass } = useCalendarContext();

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
                alert("Failed to delete class. Please try again. ");
                console.log("Error deleting class:", error);
            }
        }
    }, [currentCombinedClass, deleteClass, setCurrentClass]);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="w-full text-left py-2 font-bold text-gray-700">
                Delete Class
            </div>
            <div className="h-full">
                {(currentCombinedClass && currentCombinedClass._id) ? (
                    <li className="flex items-center justify-center">
                        <button
                            onClick={handleDeleteClass}
                            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors cursor-pointer"
                            aria-label="Delete class"
                        >
                            Delete Class
                        </button>
                    </li>
                ) : (
                    <div className="flex items-center justify-center text-center h-full text-gray-400 pb-8">
                        <p>Select a class to delete</p>
                    </div>
                )
                }
            </div>
        </div>
    )
}

export default DeleteClass;