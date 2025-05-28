'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { insertTags } from "@/lib/DatabaseUtils";
import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import { tagType } from "@/lib/types";

const AddTag = () => {
    const { tagList } = useCalendarContext();
    const [tag, setTag] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedTag = tag.trim();

        if (!trimmedTag) return;

        const success = await insertTags([{ tagName: trimmedTag, tagCategory: "user" } as tagType]);
        if (success) {
            if (!tagList.has(trimmedTag)) {
                tagList.set(trimmedTag, { tagCategory: "user", classIds: new Set() });
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
            className="p-4 max-w-md mx-auto space-y-4 text-black dark:text-gray-300"
        >
            <h2 className="text-xl font-semibold">Add New Tag</h2>

            <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Enter tag name"
                className="w-full p-2 border rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                autoFocus
            />

            <button
                type="submit"
                disabled={!tag.trim()}
                className="w-full p-2 text-white bg-blue-500 dark:bg-blue-600 rounded-md 
                         hover:bg-blue-600 dark:hover:bg-blue-500 
                         disabled:bg-gray-300 dark:disabled:bg-zinc-600 
                         disabled:text-gray-500 dark:disabled:text-gray-400
                         disabled:cursor-not-allowed transition-colors"
            >
                Add Tag
            </button>
        </form>
    );
};

export default AddTag;