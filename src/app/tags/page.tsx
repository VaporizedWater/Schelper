'use client';
import AddTagButton from "@/components/AddTagButton/AddTagButton";
import TagDisplay from "@/components/TagDisplay/TagDisplay";
import { insertTag } from "@/lib/utils";

const ManageTags = () => {
    const handleAddTag = (newTagName: string) => {
        insertTag(newTagName);
    };

    return (
        <div className="flex flex-col items-right">
            <h1 className="text-4xl text-bold py-6 text-center">Manage Tags</h1>

            {/* Tag Menu */}
            <div className="flex justify-center pb-4 gap-2">
                <AddTagButton onAddTag={handleAddTag} />
                <AddTagButton onAddTag={handleAddTag} />
                <div></div>
            </div>


            {/* Display all tags*/}
            <div className="px-10 w-full flex flex-col gap-3">
                <TagDisplay />
            </div>
        </div>
    );
};

export default ManageTags;
