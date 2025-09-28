"use client";
import { useCallback, useState } from "react";
import { MdAdd, MdExpandLess, MdExpandMore } from "react-icons/md";
import DropDown from "../DropDown/DropDown";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { insertTags } from "@/lib/DatabaseUtils";
import { useToast } from "../Toast/Toast";

// Helpers
const norm = (v: unknown) =>
    String(v ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "");

const AddTagButton = () => {
    const { tagList } = useCalendarContext();
    const [inputValue, setInputValue] = useState("");
    const { toast } = useToast();

    const handleAddTag = useCallback(async () => {
        if (inputValue.trim() !== "") {
            const trimmedValue = norm(inputValue)
            const result = await insertTags([{ tagName: trimmedValue, tagCategory: "user" }]);

            if (result) {
                if (!tagList.has(trimmedValue)) {
                    tagList.set(trimmedValue, { tagCategory: "user", classIds: new Set() });
                }
                setInputValue("");

                // Display success message
                toast({ description: "Tag added successfully: " + trimmedValue, variant: 'success' });
            } else {
                toast({ description: "Failed to add tag: " + trimmedValue, variant: 'error' });
                console.error("Failed to add tag");
            }
        }
    }, [inputValue, tagList]); // eslint-disable-line react-hooks/exhaustive-deps

    const renderDropDown = useCallback(() => {
        return (
            <div className="p-3 bg-white dark:bg-zinc-700">
                <input
                    type="text"
                    className="border dark:border-zinc-600 px-2 py-1 rounded-md w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-200 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
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
        <div className="flex flex-row bg-white dark:bg-zinc-700 gap-2 p-2 items-center shadow-lg border border-gray-300 dark:border-zinc-600 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors duration-150 w-fit text-black dark:text-gray-200">
            <MdAdd className="size-7 text-lightblack dark:text-gray-200" />
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
            dropdownClassName="absolute left-auto right-0 mt-2 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-md shadow-md"
        />
    );
};

export default AddTagButton;