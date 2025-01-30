'use client';
import AddTagButton from "@/components/AddTagButton/AddTagButton";
import TagDisplay from "@/components/TagDisplay/TagDisplay";
import { useState, useEffect } from "react";

const ManageTags = () => {
    const [tags, setTags] = useState<{ tagName: string; classes: number[] }[]>([]);

    // Load tags from localStorage on mount
    useEffect(() => {
        const storedTags = JSON.parse(localStorage.getItem("tags") || "[]");
        setTags(storedTags);
    }, []);

    // Add a new tag and update localStorage
    const handleAddTag = (newTagName: string) => {
        const updatedTags = [...tags, { tagName: newTagName, classes: [1, 2, 3] }];
        setTags(updatedTags);
        localStorage.setItem("tags", JSON.stringify(updatedTags));
    };

    return (
        <div className="flex flex-col items-right">
            <h1 className="text-4xl text-bold py-6 text-center">Manage Tags</h1>

            <AddTagButton onAddTag={handleAddTag} />

            {/* Display all tags*/}
            <div className="px-10 w-full flex flex-col gap-3">
                {tags.map((tag, index) => (
                    <TagDisplay key={index} tagName={tag.tagName} classes={tag.classes} />
                ))}
            </div>
        </div>
    );
};

export default ManageTags;
