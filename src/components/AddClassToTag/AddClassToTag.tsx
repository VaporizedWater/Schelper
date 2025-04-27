"use client";

import { useCallback } from "react";
import DropDown from "../DropDown/DropDown";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { BiLink } from "react-icons/bi";
import { tagCategory } from "@/lib/types";

interface AddClassToTagProps {
    tagId: string;
    tagCategory: tagCategory;
}

const AddClassToTag = ({ tagId, tagCategory }: AddClassToTagProps) => {
    const { allClasses, tagList, updateOneClass } = useCalendarContext();

    // Filter classes that don't already have the tag
    const availableClasses = allClasses.filter(
        (c) => !c.properties.tags.includes({ tagName: tagId, tagCategory: tagCategory })
    );

    const handleSelectClass = useCallback(async (classId: string) => {
        try {
            // Find the class to update
            const classToUpdate = allClasses.find(
                (c) => c._id === classId
            );
            if (!classToUpdate) {
                console.log("Class not found");
                return;
            }

            // Update the class's tags array
            const updatedTags = [...classToUpdate.properties.tags, { tagName: tagId, tagCategory: tagCategory }];
            classToUpdate.properties.tags = updatedTags;

            // Optionally update the tagList in your context:
            if (tagList.has(tagId)) {
                tagList.get(tagId)?.classIds.add(classId);
            } else {
                tagList.set(tagId, { tagCategory: tagCategory, classIds: new Set([classId]) });
            }

            // Update the class in the CalendarContext
            await updateOneClass(classToUpdate);
            console.log("Class updated with new tag", classToUpdate);
        } catch (error) {
            console.error("Error updating class:",error);
        }
    }, [allClasses, tagList, tagCategory, tagId, updateOneClass]);

    const renderButton = useCallback((isOpen: boolean) => {
        return (
            <div className="flex flex-row items-center bg-blue-500 text-white rounded-sm px-2 py-1 ">
                <BiLink className="text-xl" />
                <p>
                    Link Class
                </p>
                {isOpen ? <MdExpandLess /> : <MdExpandMore />}
            </div>
        );
    }, []);

    const renderDropDown = useCallback(() => {
        return (
            <ul className="bg-white border rounded-sm shadow-lg">
                {availableClasses.length ? (
                    availableClasses.map((c) => (
                        <li
                            key={c._id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelectClass(c._id)}
                        >
                            {c.data.title}
                        </li>
                    ))
                ) : (
                    <li className="p-2 text-gray-500">No available classes</li>
                )}
            </ul>
        );
    }, [availableClasses, handleSelectClass]);

    return (
        <DropDown
            renderButton={renderButton}
            renderDropdown={renderDropDown}
            buttonClassName="hover:bg-grayblue cursor-pointer w-full flex justify-center py-1"
            dropdownClassName="w-full my-1"
        />
    );
};

export default AddClassToTag;
