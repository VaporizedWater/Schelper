'use client'
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import DropDown from "../DropDown/DropDown";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { useCallback, useEffect, useState } from "react";
import { BiUnlink } from "react-icons/bi";
import { tagType } from "@/lib/types";

const TagDisplay = () => {
    const { tagList, allClasses, unlinkTagFromClass, unlinkAllClassesFromTag } = useCalendarContext();
    const [hoveredTagId, setHoveredTagId] = useState<string | null>(null);
    const [hoveredTagClassId, setHoveredTagClassId] = useState<string[] | null>(null);
    const [unlinkedTags, setUnlinkedTags] = useState<tagType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Update unlinkedTags when tagList changes
        const newUnlinkedTags: tagType[] = [];
        tagList.forEach((tagData, tag) => {
            if (tagData.tagCategory === "user" && tagData.classIds.size === 0) {
                newUnlinkedTags.push({ tagName: tag, tagCategory: tagData.tagCategory });
            }
        });
        setUnlinkedTags(newUnlinkedTags);
        setIsLoading(false);
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

    if (isLoading) {
        return (
            <div role="status" aria-live="polite" className="flex justify-center items-center p-4 animate-pulse">
                Loading tags...
            </div>
        );
    }

    return (
        <div role="region" aria-labelledby="tag-display-title" className="text-black dark:text-gray-300">
            <h2 id="tag-display-title" className="sr-only">
                Tag list
            </h2>
            <ul role="list" aria-label="User-defined tags" className="grid grid-cols-3 gap-3">
                {/* Render linked tags with prefixed key */}
                {
                    Array.from(tagList)
                        .filter(([, tagData]) => { return tagData.tagCategory === "user" && tagData.classIds.size !== 0 })
                        .sort(([, tagIdA], [, tagIdB]) => tagIdB.classIds.size - tagIdA.classIds.size)
                        .map(([tagId, tagData]) => (
                            <li
                                key={`linked-${tagId}`}
                                role="listitem"
                                onMouseEnter={() => setHoveredTagId(tagId)}
                                onMouseLeave={() => setHoveredTagId(null)}
                            >
                                <DropDown
                                    buttonClassName="w-full"
                                    renderButton={(isOpen) => (
                                        <div
                                            role="button"
                                            aria-haspopup="true"
                                            aria-expanded={isOpen}
                                            aria-label={`Tag ${tagId}, ${tagData.classIds.size} class${tagData.classIds.size > 1 ? 'es' : ''}`}
                                            className="hover:bg-gray-200 dark:hover:bg-zinc-600 flex justify-between items-center p-2 bg-gray-100 dark:bg-zinc-700 rounded-sm cursor-pointer transition-colors duration-150"
                                        >
                                            <span>
                                                {tagId}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{tagData.classIds.size} Class{tagData.classIds.size > 1 && `es`}</span>
                                                {hoveredTagId === tagId && (
                                                    <div
                                                        role="button"
                                                        tabIndex={0}
                                                        aria-label={`Unlink tag ${tagId} from all classes`}
                                                        className="hover:bg-gray-300 dark:hover:bg-zinc-500 p-1 rounded-sm cursor-pointer transition-colors duration-150"
                                                        onClick={(e) => {
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
                                            <ul
                                                role="list"
                                                aria-label={`Classes linked to tag ${tagId}`}
                                                className="flex flex-col gap-1 bg-white dark:bg-zinc-700 border border-gray-300 dark:border-zinc-600 rounded-sm shadow-lg"
                                            >
                                                {Array.from(tagData.classIds).map((classId) => {
                                                    const foundClass = allClasses.find((cls) => String(cls._id) === classId);
                                                    return (
                                                        <li
                                                            key={classId}
                                                            role="listitem"
                                                            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-600 flex justify-between items-center transition-colors duration-150"
                                                            onMouseEnter={() => setHoveredTagClassId([tagId, classId])}
                                                            onMouseLeave={() => setHoveredTagClassId(null)}
                                                        >
                                                            <span>
                                                                {foundClass ? foundClass.data.course_subject + " " + foundClass.data.course_num + " " + foundClass.data.title : classId}
                                                            </span>
                                                            {hoveredTagClassId && hoveredTagClassId[0] === tagId && hoveredTagClassId[1] === classId && (
                                                                <div
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    aria-label={`Unlink class ${classId} from tag ${tagId}`}
                                                                    className="hover:bg-gray-300 dark:hover:bg-zinc-500 p-1 rounded-sm cursor-pointer transition-colors duration-150"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleClassUnlink(tagId, classId)
                                                                    }}
                                                                >
                                                                    <BiUnlink />
                                                                </div>
                                                            )}
                                                        </li>
                                                    );
                                                })}
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
                        return (
                            <li
                                key={`unlinked-${tag.tagName}-${index}`}
                                role="listitem"
                                onMouseEnter={() => setHoveredTagId(tag.tagName)}
                                onMouseLeave={() => setHoveredTagId(null)}
                                className="flex justify-between items-center p-2 bg-gray-100 dark:bg-zinc-700 rounded-sm hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors duration-150"
                                aria-label={`Tag ${tag.tagName}, no classes linked`}
                            >
                                <span>{tag.tagName}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">0 classes</span>
                            </li>
                        );
                    })
                }
            </ul >
        </div >
    );
};

export default TagDisplay;