'use client'
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import DropDown from "../DropDown/DropDown";
import { MdDelete, MdExpandLess, MdExpandMore } from "react-icons/md";
// import AddClassToTag from "../AddClassToTag/AddClassToTag";
import { useState } from "react";
import { deleteTag } from "@/lib/utils";
import { BiUnlink } from "react-icons/bi";

const TagDisplay = () => {
    const { tagList, allTags, allClasses, unlinkAllClassesFromTag, unlinkTagFromClass } = useCalendarContext();
    const [hoveredTagId, setHoveredTagId] = useState<string | null>(null);
    const [hoveredTagClassId, setHoveredTagClassId] = useState<string[] | null>(null);

    // Get the IDs of tags that are linked to classes.
    const linkedTagIds = new Set(Array.from(tagList).map(([tagId]) => tagId));

    interface TagObject {
        _id: string;
    }

    // Filter allTags to get unlinked tags; if tag is an object, use its _id as key
    const unlinkedTags = Array.from(allTags).filter((tag: string | TagObject) => {
        // When tag is an object, compare using tag._id; otherwise, use the tag value directly.
        return typeof tag === "object" ? !linkedTagIds.has(tag._id) : !linkedTagIds.has(tag);
    });

    const handleTagDelete = (tagName: string) => {
        console.log("Delete tag");
        const isConfirmed = window.confirm(`Are you sure you want to delete the tag "${tagName}"?`);

        if (isConfirmed) {
            unlinkAllClassesFromTag(tagName);
            deleteTag(tagName);
            tagList.delete(tagName);
        }
    }

    const handleEmptyTagDelete = (tagName: string) => {
        console.log("Delete empty tag");
        const isConfirmed = window.confirm(`Delete the empty tag "${tagName}"?`);

        if (isConfirmed) {
            deleteTag(tagName);
            tagList.delete(tagName);
        }
    }

    const handleClassUnlink = (tagId: string, classId: string) => {
        // Get class name from id
        const className = allClasses.find((cls) => String(cls.classData._id) === classId)?.classData.title;

        console.log(`Unlink class "${className}" with id "${classId}" from tag "${tagId}"`);
        const isConfirmed = window.confirm(`Unlink class "${className}" from tag "${tagId}"?`);

        if (isConfirmed) {
            unlinkTagFromClass(tagId, classId);
        }
    }

    return (
        <div>
            <ul className="flex flex-col gap-3">
                {/* Render linked tags with prefixed key */}
                {Array.from(tagList).map(([tagId, tagData]) => (
                    <li
                        key={`linked-${tagId}`}
                        onMouseEnter={() => setHoveredTagId(tagId)}
                        onMouseLeave={() => setHoveredTagId(null)}
                    >
                        <DropDown
                            buttonClassName="w-full"
                            renderButton={(isOpen) => (
                                <div className="hover:bg-grayblue flex justify-between items-center p-2 bg-gray-100 rounded cursor-pointer">
                                    <span>
                                        {tagId} : {tagData.classIds.size} Class
                                        {tagData.classIds.size > 1 ? "es" : ""}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {hoveredTagId === tagId && (
                                            <div className="hover:bg-gray-300 p-1 rounded cursor-pointer" onClick={(e) => {
                                                e.stopPropagation();
                                                handleTagDelete(tagId)
                                            }}>
                                                <MdDelete />
                                            </div>
                                        )}
                                        {isOpen ? <MdExpandLess /> : <MdExpandMore />}
                                    </div>

                                </div>
                            )}

                            dropdownClassName="w-full mt-1"
                            renderDropdown={() => (
                                <div>
                                    <ul className="flex flex-col gap-1 bg-white border rounded shadow-lg">
                                        {Array.from(tagData.classIds).map((classId) => {
                                            const foundClass = allClasses.find(
                                                (cls) => String(cls.classData._id) === classId
                                            );
                                            return (
                                                <li
                                                    key={classId} className="p-2 hover:bg-gray-100 flex justify-between items-center"
                                                    onMouseEnter={() => setHoveredTagClassId([tagId, classId])}
                                                    onMouseLeave={() => setHoveredTagClassId(null)}
                                                >
                                                    {foundClass ? foundClass.classData.title : classId}
                                                    {hoveredTagClassId && hoveredTagClassId[0] === tagId && hoveredTagClassId[1] === classId && (
                                                        <div className="hover:bg-gray-300 p-1 rounded cursor-pointer" onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleClassUnlink(tagId, classId)
                                                        }}>
                                                            <BiUnlink />
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    {/* AddClassToTag component */}
                                    {/* <AddClassToTag tagId={tagId} /> */}
                                </div>
                            )}
                        />
                    </li>
                ))}
                {unlinkedTags.map((tag: string | TagObject, index) => {
                    const keyValue =
                        typeof tag === "object" && tag._id ? tag._id.toString() : tag.toString();
                    const displayValue =
                        typeof tag === "object" && tag._id ? tag._id.toString() : tag.toString();
                    return (
                        <li
                            key={`unlinked-${keyValue}-${index}`}
                            onMouseEnter={() => setHoveredTagId(keyValue)}
                            onMouseLeave={() => setHoveredTagId(null)}
                        >
                            <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                <span>{displayValue} : 0 Classes</span>
                                {hoveredTagId === keyValue && (
                                    <div className="hover:bg-gray-300 p-1 rounded cursor-pointer" onClick={(e) => {
                                        e.stopPropagation();
                                        handleEmptyTagDelete(keyValue)
                                    }}>
                                        <MdDelete />
                                    </div>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default TagDisplay;