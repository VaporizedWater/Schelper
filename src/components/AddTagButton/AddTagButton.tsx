'use client';
import { useState } from "react";
import { MdAdd, MdExpandLess, MdExpandMore } from "react-icons/md";
import DropDown from "../DropDown/DropDown";
import { insertTag } from "@/lib/utils";

interface AddTagButtonProps {
    onAddTag: (tagName: string) => void;
}

const AddTagButton = ({ onAddTag }: AddTagButtonProps) => {
    const [inputValue, setInputValue] = useState("");

    const handleAddTag = async () => {
        if (inputValue.trim() !== "") {
            const result = await insertTag(inputValue.trim());
            if (result) {
                onAddTag(result);
                setInputValue("");
            } else {
                console.error("Failed to add tag");
            }
        }
    };

    return (
        <DropDown
            renderButton={(isOpen) => (
                <div className="flex flex-row bg-white gap-2 p-2 items-center shadow-lg border border-gray rounded-lg hover:bg-grayblue duration-100 w-fit">
                    <MdAdd className="size-7 text-lightblack" />
                    <span>Add Tag</span>
                    <div className="ml-auto">
                        {isOpen ? <MdExpandLess /> : <MdExpandMore />}
                    </div>
                </div>
            )}
            renderDropdown={() => (
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
            )}
            buttonClassName=""
            dropdownClassName="absolute left-auto right-0 mt-12 bg-white border border-gray-300 rounded-md shadow-md"
        />
    );
};

export default AddTagButton;