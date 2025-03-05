"use client";

import { useState } from "react";
import DropDown from "../DropDown/DropDown";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { BiLink } from "react-icons/bi";

interface AddClassToTagProps {
    tagId: string;
}

const AddClassToTag = ({ tagId }: AddClassToTagProps) => {
    const { allClasses, tagList, updateOneClass } = useCalendarContext();
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
        await updateOneClass(classToUpdate);
    };

    return (
        <DropDown
            renderButton={(isOpen) => (
                <div className="flex flex-row items-center bg-blue-500 text-white rounded px-2 py-1 ">
                    <BiLink className="text-xl" />
                    <p>
                        Link Class
                    </p>
                    {isOpen ? <MdExpandLess /> : <MdExpandMore />}
                </div>
            )}
            renderDropdown={() => (
                <ul className="bg-white border rounded shadow-lg">
                    {availableClasses.length ? (
                        availableClasses.map((c) => (
                            <li
                                key={c.classData._id}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
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
            buttonClassName="hover:bg-grayblue cursor-pointer w-full flex justify-center py-1"
            dropdownClassName="w-full my-1"
        />
    );
};

export default AddClassToTag;
