"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { insertTags } from "@/lib/DatabaseUtils";
import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import { tagType } from "@/lib/types";
import { useToast } from "@/components/Toast/Toast";

const AddTag = () => {
    const { tagList } = useCalendarContext();
    const [tag, setTag] = useState("");
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedTag = tag.trim();

        if (!trimmedTag) {
            toast({ description: 'Tag name cannot be empty', variant: 'error' });
            return;
        }

        const success = await insertTags([{ tagName: trimmedTag, tagCategory: "user" } as tagType]);
        if (success) {
            if (!tagList.has(trimmedTag)) {
                tagList.set(trimmedTag, { tagCategory: "user", classIds: new Set() });
            }

            toast({ description: `Tag added successfully: ${trimmedTag}`, variant: 'success' });
            router.back();
        } else {
            toast({ description: `Failed to add tag: ${trimmedTag}`, variant: 'error' });
        }
    };

    return (
        <section
            aria-labelledby="add-tag-heading"
            className="p-4 max-w-md mx-auto text-black dark:text-gray-300"
        >
            <h2 id="add-tag-heading" className="text-xl font-semibold">
                Add New Tag
            </h2>

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <div>
                    <label
                        htmlFor="tag-input"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                    >
                        Tag Name
                    </label>
                    <input
                        id="tag-input"
                        name="tag"
                        type="text"
                        value={tag}
                        onChange={(e) => {
                            setTag(e.target.value);
                        }}
                        placeholder="Enter tag name"
                        className="w-full p-2 border rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        autoFocus
                        aria-required="true"
                    />
                </div>

                <button
                    id="add-tag-submit"
                    type="submit"
                    disabled={!tag.trim()}
                    className="w-full p-2 text-white bg-blue-500 dark:bg-blue-600 rounded-md 
                     hover:bg-blue-600 dark:hover:bg-blue-500 
                     disabled:bg-gray-300 dark:disabled:bg-zinc-600 
                     disabled:text-gray-500 dark:disabled:text-gray-400
                     disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                    aria-disabled={!tag.trim()}
                    title="Add Tag"
                >
                    Add Tag
                </button>
            </form>
        </section>
    );
};

export default AddTag;
