'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";

const AddTag = () => {
    const [isOpen, setOpen] = useState(true);
    const [inputValue, setInputValue] = useState("");
    const router = useRouter(); // Initialize router

    // Function to handle adding a tag
    const handleAddTag = () => {
        if (inputValue.trim() !== "") {
            try {
                const storedTags = JSON.parse(localStorage.getItem("tags") || "[]");

                // Add new tag and update localStorage
                const updatedTags = [...storedTags, { tagName: inputValue.trim(), classes: [12, 13, 14, 15] }];
                localStorage.setItem("tags", JSON.stringify(updatedTags));

                setInputValue("");
                setOpen(false); // Close the modal
                router.push('/tags'); // Navigate to the tags page
            } catch (error) {
                console.error("Error saving tag:", error);
            }
        }
    };

    return (
        <div className="relative flex justify-center items-center min-h-screen">
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white border border-gray-300 rounded-md shadow-md p-6 w-96">
                        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setOpen(false)}>
                            &times;
                        </button>

                        <h2 className="text-lg font-semibold mb-4">Add New Tag</h2>
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
                        <div className="flex justify-end mt-4">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleAddTag}>
                                Add Tag
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddTag;
