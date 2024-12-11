'use client';
import AddTagButton from "@/components/AddTagButton/AddTagButton";
import TagDisplay from "@/components/TagDisplay/TagDisplay";
import { useState } from "react";

const ManageTags = () => {

    const [tags, setTags] = useState([
        { tagName: "Test", classes: [12, 13, 14, 15] },
        { tagName: "Test", classes: [12, 13, 14, 15] },
        { tagName: "Test", classes: [12, 13, 14, 15] },
    ]);

    // Add a new tag
    const handleAddTag = (newTagName: string) => {
        // Append a new tag with the entered name and an empty classes array
        setTags((prevTags) => [...prevTags, { tagName: newTagName, classes: [9, 10, 11] }]);
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
