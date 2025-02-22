'use client';
import AddTagButton from "@/components/AddTagButton/AddTagButton";
import TagDisplay from "@/components/TagDisplay/TagDisplay";
import { insertTag } from "@/lib/utils";
import { BiUnlink } from "react-icons/bi";
import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";

const ManageTags = () => {
    const { unlinkAllTagsFromAllClasses } = useCalendarContext();

    const handleAddTag = (newTagName: string) => {
        insertTag(newTagName);
    };

    return (
        <div className="flex flex-col items-right">
            <h1 className="text-4xl text-bold py-6 text-center">Manage Tags</h1>

            {/* Tag Menu */}
            <div className="flex justify-center pb-4 gap-2">
                <AddTagButton onAddTag={handleAddTag} />

                <button
                    className="flex gap-2 items-center justify-center bg-white px-2 shadow-lg border border-gray rounded-lg hover:bg-grayblue duration-100 w-fit"
                    onClick={() => {
                        // Get confirmation from user
                        const isConfirmed = window.confirm("Are you sure you want to unlink all tags from all classes?\n (This will not delete any tags)");
                        if (!isConfirmed) return;

                        // unlink all tags
                        unlinkAllTagsFromAllClasses();
                    }}
                >
                    <BiUnlink className="text-xl" />
                    <span className="pr-2">Unlink All</span>
                </button>
            </div>


            {/* Display all tags*/}
            <div className="px-10 w-full flex flex-col gap-3">
                <TagDisplay />
            </div>
        </div>
    );
};

export default ManageTags;
