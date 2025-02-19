'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { insertTag } from "@/lib/utils";

const AddTag = () => {
    const [inputValue, setInputValue] = useState("");
    const router = useRouter();

    const handleAddTag = async () => {
        if (inputValue.trim() !== "") {
            const result = await insertTag(inputValue.trim());
            if (result) {
                setInputValue("");
                router.push('/tags');
            } else {
                console.error("Failed to insert tag");
            }
        }
    };

    return (
        <div className="p-8 max-w-xl mx-auto">
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
    );
};

export default AddTag;
