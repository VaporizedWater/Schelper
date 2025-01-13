'use client';
import { useState } from "react";
import { MdAdd } from "react-icons/md";

// Props interface for the AddTagButton component
interface AddTagButtonProps {
    onAddTag: (tagName: string) => void;
}

const AddTagButton = ({ onAddTag }: AddTagButtonProps) => {
    // Control dropdown visibility
    const [isOpen, setOpen] = useState(false);

    // Store the user input for the tag name
    const [inputValue, setInputValue] = useState("");

    // Handle adding the tag when user presses Enter
    const handleAddTag = async () => {
        if (inputValue.trim() !== "") {
            try {
                const response = await fetch("/api/tags", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ tagName: inputValue.trim() }),
                });

                if (response.ok) {
                    onAddTag(inputValue.trim());
                    setInputValue("");
                    setOpen(false);
                } else {
                    console.error("Failed to add tag:", await response.text());
                }
            } catch (error) {
                console.error("Error adding tag:", error);
            }
        }
    };

    return (
        <div className="relative flex justify-end">

            <button className="flex flex-row bg-white gap-2 p-2 items-center shadow-lg border border-gray rounded-lg hover:bg-grayblue duration-100 w-fit"
                onClick={() => setOpen((prev) => !prev)}>
                <div className="">
                    <MdAdd className="size-7 text-lightblack"></MdAdd>
                </div>
                <div>
                    Add Tag
                </div>
            </button>

            {isOpen && (
                <div className="absolute left-auto right-0 mt-12 bg-white border border-gray-300 rounded-md shadow-md p-3">
                    <input
                        type="text"
                        className="border px-2 py-1 rounded-md w-full"
                        placeholder="Enter tag name"
                        value={inputValue} // Controlled component for input
                        onChange={(e) => setInputValue(e.target.value)} // Update input value on change
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddTag(); // Add tag on Enter key
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default AddTagButton;
