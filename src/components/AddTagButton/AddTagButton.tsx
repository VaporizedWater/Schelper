'use client';
import { useCallback, useState } from "react";
import { MdAdd, MdExpandLess, MdExpandMore } from "react-icons/md";
import DropDown from "../DropDown/DropDown";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { insertTags } from "@/lib/DatabaseUtils";

const AddTagButton = () => {
    const { tagList } = useCalendarContext();
    const [inputValue, setInputValue] = useState("");

    const handleAddTag = useCallback(async () => {
        if (inputValue.trim() !== "") {
            const trimmedValue = inputValue.trim();
            const result = await insertTags([{ tagName: trimmedValue, tagCategory: "user" }]);

            if (result) {
                if (!tagList.has(trimmedValue)) {
                    tagList.set(trimmedValue, { tagCategory: "user", classIds: new Set() });
                }
                setInputValue("");

                // Display success message
                alert("Tag added successfully: " + trimmedValue);
            } else {
                alert("Failed to add tag" + trimmedValue);
                console.error("Failed to add tag");
            }
        }
    }, [inputValue, tagList]);

    const renderDropDown = useCallback(() => {
        return (
            <div className="p-3">
                <input
                    type="text"
                    className="border px-2 py-1 rounded-md w-full"
                    placeholder="Enter tag name"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddTag();
                    }}
                />
            </div>
        );
    }, [inputValue, handleAddTag]);

    const renderButton = useCallback((isOpen: boolean) => (
        <div className="flex flex-row bg-white gap-2 p-2 items-center shadow-lg border border-gray rounded-lg hover:bg-grayblue duration-100 w-fit">
            <MdAdd className="size-7 text-lightblack" />
            <span>Create Tag</span>
            <div className="ml-auto">
                {isOpen ? <MdExpandLess /> : <MdExpandMore />}
            </div>
        </div>
    ), []);

    return (
        <DropDown
            renderButton={renderButton}
            renderDropdown={renderDropDown}
            buttonClassName=""
            dropdownClassName="absolute left-auto right-0 mt-2 bg-white border border-gray-300 rounded-md shadow-md"
        />
    );
};

export default AddTagButton;