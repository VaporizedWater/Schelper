'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { insertTags } from "@/lib/DatabaseUtils";
import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import { tagType } from "@/lib/types";

const AddTag = () => {
    const { tagList } = useCalendarContext();
    const [tag, setTag] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedTag = tag.trim();

        if (!trimmedTag) {
            setError("Tag name cannot be empty");
            return;
        }

        const success = await insertTags([{ tagName: trimmedTag, tagCategory: "user" } as tagType]);
        if (success) {
            if (!tagList.has(trimmedTag)) {
                tagList.set(trimmedTag, { tagCategory: "user", classIds: new Set() });
            }

            // Use an accessible alert
            const alertEl = document.getElementById("add-tag-alert");
            if (alertEl) {
                alertEl.textContent = `Tag added successfully: ${trimmedTag}`;
            }
            setError(null);
            // Delay so screen readers can catch the alert
            setTimeout(() => router.back(), 500);
        } else {
            setError(`Failed to add tag: ${trimmedTag}`);
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
                aria-describedby={error ? "add-tag-error" : undefined}
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
                            if (error) setError(null);
                        }}
                        placeholder="Enter tag name"
                        className="w-full p-2 border rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        autoFocus
                        aria-required="true"
                    />
                    {error && (
                        <p
                            id="add-tag-error"
                            role="alert"
                            className="mt-1 text-sm text-red-600 dark:text-red-400"
                        >
                            {error}
                        </p>
                    )}
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

            {/* Live region for success/failure */}
            <div
                id="add-tag-alert"
                role="status"
                aria-live="polite"
                className="sr-only"
            />
        </section>
    );
};

export default AddTag;
