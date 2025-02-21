"use client";

import { useState } from "react";
import DropDown from "../DropDown/DropDown";
import { useCalendarContext } from "../CalendarContext/CalendarContext";

interface AddClassToTagProps {
    tagId: string;
}

const AddClassToTag = ({ tagId }: AddClassToTagProps) => {
    const { allClasses, tagList, updateCurrentClass } = useCalendarContext();
    const [error, setError] = useState<string | null>(null);

    // Filter classes that don't already have the tag
    const availableClasses = allClasses.filter(
        (c) => !c.classProperties.tags.includes(tagId)
    );

    const handleSelectClass = async (classId: string) => {
        // Find the class to update
        const classToUpdate = allClasses.find(
            (c) => c.classData._id === classId
        );
        if (!classToUpdate) {
            setError("Class not found");
            console.log(error);
            return;
        }

        // Update the class's tags array
        const updatedTags = [...classToUpdate.classProperties.tags, tagId];
        classToUpdate.classProperties.tags = updatedTags;

        // Optionally update the tagList in your context:
        if (tagList.has(tagId)) {
            tagList.get(tagId)?.classIds.add(classId);
        } else {
            tagList.set(tagId, { classIds: new Set([classId]) });
        }

        // Update the class in the CalendarContext
        await updateCurrentClass(classToUpdate);
    };

    return (
        <DropDown
            renderButton={() => (
                <button className="px-2 py-1 bg-blue-500 text-white rounded">
                    Add Class
                </button>
            )}
            renderDropdown={() => (
                <ul className="bg-white border rounded shadow-lg">
                    {availableClasses.length ? (
                        availableClasses.map((c) => (
                            <li
                                key={c.classData._id}
                                className="p-2 hover:bg-gray-200 cursor-pointer"
                                onClick={() => handleSelectClass(c.classData._id)}
                            >
                                {c.classData.title}
                            </li>
                        ))
                    ) : (
                        <li className="p-2 text-gray-500">No available classes</li>
                    )}
                </ul>
            )}
            buttonClassName="w-full"
            dropdownClassName="w-full mt-1"
        />
    );
};

export default AddClassToTag;
