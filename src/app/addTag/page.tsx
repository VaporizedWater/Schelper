'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { insertTag } from "@/lib/DatabaseUtils";
import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";

const AddTag = () => {
    const { tagList } = useCalendarContext();
    const [tag, setTag] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedTag = tag.trim();

        if (!trimmedTag) return;

        const success = await insertTag(trimmedTag);
        if (success) {
            if (!tagList.has(trimmedTag)) {
                tagList.set(trimmedTag, new Set());
            }

            // Display success message
            alert("Tag added successfully: " + trimmedTag);
            router.back();
        } else {
            alert("Failed to add tag" + trimmedTag);
            console.error("Failed to add tag");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="p-4 max-w-md mx-auto space-y-4"
        >
            <h2 className="text-xl font-semibold">Add New Tag</h2>

            <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Enter tag name"
                className="w-full p-2 border rounded-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                autoFocus
            />

            <button
                type="submit"
                disabled={!tag.trim()}
                className="w-full p-2 text-white bg-blue-500 rounded 
                         hover:bg-blue-600 disabled:bg-gray-300 
                         disabled:cursor-not-allowed transition-colors"
            >
                Add Tag
            </button>
        </form>
    );
};

export default AddTag;