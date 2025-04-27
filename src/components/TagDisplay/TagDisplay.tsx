'use client'
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import DropDown from "../DropDown/DropDown";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
// import AddClassToTag from "../AddClassToTag/AddClassToTag";
import { useCallback, useEffect, useState } from "react";
import { BiUnlink } from "react-icons/bi";
import AddClassToTag from "../AddClassToTag/AddClassToTag";
import { tagType } from "@/lib/types";

const unlinkedTags = [] as tagType[];

const TagDisplay = () => {
    const { tagList, allClasses, unlinkTagFromClass, unlinkAllClassesFromTag } = useCalendarContext();
    const [hoveredTagId, setHoveredTagId] = useState<string | null>(null);
    const [hoveredTagClassId, setHoveredTagClassId] = useState<string[] | null>(null);

    useEffect(() => {
        tagList.entries().forEach(([tag, tagCategoryAndClassIds]) => {
            const classIds = tagCategoryAndClassIds.classIds;
            if (tagCategoryAndClassIds.tagCategory === "user" && classIds.size === 0) {
                unlinkedTags.push({ tagName: tag, tagCategory: tagCategoryAndClassIds.tagCategory });
            }
        });
    }, [tagList]);
    

    const handleTagUnlink = useCallback((tagName: string) => {
        const isConfirmed = window.confirm(`unlink tag "${tagName}" from all its classes?`);

        if (isConfirmed) {
            unlinkAllClassesFromTag(tagName);
            tagList.delete(tagName);
        }
    }, [tagList, unlinkAllClassesFromTag]);

    const handleClassUnlink = useCallback((tagId: string, classId: string) => {
        // Get class name from id
        const className = allClasses.find((cls) => String(cls._id) === classId)?.data.title;

        console.log(`Unlink class "${className}" with id "${classId}" from tag "${tagId}"`);
        const isConfirmed = window.confirm(`Unlink class "${className}" from tag "${tagId}"?`);

        if (isConfirmed) {
            unlinkTagFromClass(tagId, classId);
        }
    }, [allClasses, unlinkTagFromClass]);

    return (
        <div>
            <ul className="grid grid-cols-3 gap-3">
                {/* Render linked tags with prefixed key */}
                {
                    Array.from(tagList)
                        .filter(([, tagData]) => { return tagData.tagCategory === "user" && tagData.classIds.size !== 0 })
                        .sort(([, tagIdA], [, tagIdB]) => tagIdB.classIds.size - tagIdA.classIds.size)
                        .map(([tagId, tagData]) => (
                            <li
                                key={`linked-${tagId}`}
                                onMouseEnter={() => setHoveredTagId(tagId)}
                                onMouseLeave={() => setHoveredTagId(null)}
                            >
                                <DropDown
                                    buttonClassName="w-full"
                                    renderButton={(isOpen) => (
                                        <div className="hover:bg-grayblue flex justify-between items-center p-2 bg-gray-100 rounded-sm cursor-pointer">
                                            <span>
                                                {tagId}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span>
                                                    Classes: {tagData.classIds.size}
                                                </span>
                                                {hoveredTagId === tagId && (
                                                    <div className="hover:bg-gray-300 p-1 rounded-sm cursor-pointer" onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTagUnlink(tagId)
                                                    }}>
                                                        <BiUnlink />
                                                    </div>
                                                )}
                                                {isOpen ? <MdExpandLess /> : <MdExpandMore />}
                                            </div>

                                        </div>
                                    )}

                                    dropdownClassName="w-full mt-1"
                                    renderDropdown={() => (
                                        <div>
                                            <ul className="flex flex-col gap-1 bg-white border rounded-sm shadow-lg">
                                                {Array.from(tagData.classIds).map((classId) => {
                                                    const foundClass = allClasses.find(
                                                        (cls) => String(cls._id) === classId
                                                    );
                                                    return (
                                                        <li
                                                            key={classId} className="p-2 hover:bg-gray-100 flex justify-between items-center"
                                                            onMouseEnter={() => setHoveredTagClassId([tagId, classId])}
                                                            onMouseLeave={() => setHoveredTagClassId(null)}
                                                        >
                                                            {foundClass ? foundClass.data.title : classId}
                                                            {hoveredTagClassId && hoveredTagClassId[0] === tagId && hoveredTagClassId[1] === classId && (
                                                                <div className="hover:bg-gray-300 p-1 rounded-sm cursor-pointer" onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleClassUnlink(tagId, classId)
                                                                }}>
                                                                    <BiUnlink />
                                                                </div>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                                <div className="">
                                                    <AddClassToTag tagId={tagId} tagCategory={tagData.tagCategory} />
                                                </div>
                                            </ul>
                                        </div>
                                    )
                                    }
                                />
                            </li >
                        ))
                }
                {
                    unlinkedTags.map((tag: tagType, index) => {
                        // const keyValue =
                        //     typeof tag === "object" && tag._id ? tag._id.toString() : tag.toString();
                        // const displayValue =
                        //     typeof tag === "object" && tag._id ? tag._id.toString() : tag.toString();
                        return (
                            <li
                                key={`unlinked-${tag}-${index}`}
                                onMouseEnter={() => setHoveredTagId(tag.tagName)}
                                onMouseLeave={() => setHoveredTagId(null)}
                            >
                                <DropDown
                                    buttonClassName="w-full"
                                    renderButton={(isOpen) => (
                                        <div className="flex justify-between items-center p-2 bg-gray-100 rounded-sm cursor-pointer">
                                            <span>{tag.tagName}</span>
                                            {isOpen ? <MdExpandLess /> : <MdExpandMore />}
                                        </div>
                                    )}
                                    dropdownClassName="w-full mt-1"
                                    renderDropdown={() => (
                                        <div>
                                            <ul className="flex flex-col gap-1 bg-white border rounded-sm shadow-lg">
                                                <div className="">
                                                    <AddClassToTag tagId={tag.tagName} tagCategory={tag.tagCategory} />
                                                </div>
                                            </ul>
                                        </div>
                                    )}
                                />
                            </li>
                        );
                    })
                }
            </ul >
        </div >
    );
};

export default TagDisplay;
