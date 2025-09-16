"use client";

import { useEffect, useRef, useState } from "react";
import DropDown from "../DropDown/DropDown";
import { BiCheck, BiChevronDown, BiChevronUp, BiMinus, BiSearch } from "react-icons/bi";
import { CategoryFilterProps } from "@/lib/types";

const CategoryFilter = ({ title, tagMap, tagStates, toggleCategoryAll, toggleOneTag }: CategoryFilterProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [totalChecked, setTotalChecked] = useState(0);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Count total checked tags whenever tagStates change
        const countChecked = () => {
            let count = 0;
            tagStates.forEach((state, tagName) => {
                if (state === "include" && tagMap.has(tagName)) count++;
            });
            setTotalChecked(count);
        };

        countChecked();
    }, [tagStates, tagMap]);

    const handleTagKeyDown = (e: React.KeyboardEvent, tagName: string) => {
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggleOneTag(tagName);
        }
    };

    const renderTagCheckbox = (tagName: string) => {
        const state = tagStates.get(tagName) ?? "neutral";
        const isInclude = state === "include";
        const isExclude = state === "exclude";

        let boxClasses =
            "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border cursor-pointer " +
            "transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ";

        if (state === "neutral") {
            boxClasses += "border-slate-300 bg-transparent hover:border-slate-400";
        } else if (isInclude) {
            boxClasses += "border-blue-600 bg-blue-600";
        } else {
            boxClasses += "border-red-600 bg-red-600";
        }

        return (
            <div
                role="checkbox"
                aria-checked={isInclude}
                tabIndex={0}
                onKeyDown={(e) => handleTagKeyDown(e, tagName)}
                onClick={(e) => {
                    e.stopPropagation();
                    toggleOneTag(tagName);
                }}
                className={boxClasses}
                title={`Filter tag "${tagName}": ${isInclude ? "Included" : isExclude ? "Excluded" : "Neutral"}`}
                aria-label={`Tag ${tagName}: ${isInclude ? "Included" : isExclude ? "Excluded" : "Neutral"}`}
            >
                {isInclude ? (
                    <BiCheck className="h-4 w-4 text-white" aria-hidden="true" />
                ) : isExclude ? (
                    <BiMinus className="h-4 w-4 text-white" aria-hidden="true" />
                ) : (
                    <span className="h-4 w-4 block opacity-0" aria-hidden="true" />
                )}
            </div>
        );
    };

    //  Render one category’s dropdown section
    const renderTagSection = (title: string, tagMap: Map<string, Set<string>>) => {
        if (tagMap.size === 0) return null;

        // derive a stable ID for this category
        const sectionId = `filter-${title.toLowerCase().replace(/\s+/g, "-")}`;

        // check if all in this category are included
        const allIncluded = Array.from(tagMap.keys()).every((t) => tagStates.get(t) === "include");

        const filteredTags = Array.from(tagMap.keys().filter((tagName) => {
            if (!searchTerm) return true; // no search, show all
            return tagName.toLowerCase().includes(searchTerm.toLowerCase())
        }
        ));

        return (
            <DropDown
                id={sectionId}
                label={`${title} filters`}
                ref={dropdownRef}
                closeOnOutsideClick={false}
                defaultOpen={false}
                buttonClassName="w-full text-left mt-1 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                dropdownClassName="relative w-full"
                darkClass="dark:bg-zinc-800"
                renderButton={(isOpen) => (
                    <div
                        role="button"
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                        aria-controls={`${sectionId}-list`}
                        tabIndex={0}
                        className="font-light text-gray-700 dark:text-gray-300 flex items-center justify-between gap-2"
                        title={`${title} filters: ${allIncluded ? "All included" : "Not all included"}`}
                    >
                        {isSearchActive ? (
                            <input
                                type="text"
                                placeholder={`Search ${title} tags...`}
                                className="w-full px-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onBlur={() => {
                                    if (!dropdownRef.current) {
                                        setIsSearchActive(false)
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                        setIsSearchActive(false);
                                        setSearchTerm("");
                                    }

                                    if (e.key === " " || e.key === "Enter") {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        ) : (
                            <div className="flex items-center">
                                {/* Category‐level “toggle all” box */}
                                <div
                                    role="button"
                                    aria-pressed={allIncluded}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === " " || e.key === "Enter") {
                                            e.preventDefault();
                                            toggleCategoryAll(tagMap);
                                        }
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCategoryAll(tagMap);
                                    }}
                                    className={
                                        "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border mr-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 " +
                                        (allIncluded
                                            ? "border-blue-600 bg-blue-600"
                                            : "border-slate-300 bg-transparent hover:border-slate-400")
                                    }
                                    title={allIncluded ? "Deselect all in “" + title + "”" : "Select all in “" + title + "”"}
                                    aria-label={allIncluded ? `Deselect all ${title}` : `Select all ${title}`}
                                >
                                    {allIncluded ? (
                                        <BiCheck className="h-4 w-4 text-white" aria-hidden="true" />
                                    ) : (
                                        <span className="h-4 w-4 block opacity-0" aria-hidden="true" />
                                    )}
                                </div>
                                <div>{title}</div>
                            </div>
                        )}
                        <span className="flex items-center">
                            <p className="px-1 text-sm text-gray-500 dark:text-gray-400">{`${totalChecked}/${filteredTags.length}`}</p>
                            <BiSearch className="h-4.5 w-4.5 text-gray-500 dark:text-gray-400" aria-hidden="true" onClick={(e) => {
                                if (isOpen != isSearchActive) {
                                    e.stopPropagation()
                                }

                                setIsSearchActive(!isSearchActive);
                            }} />
                            {isOpen ? <BiChevronUp aria-hidden="true" /> : <BiChevronDown aria-hidden="true" />}
                        </span>
                    </div>

                )
                }
                renderDropdown={() => (
                    <div id={`${sectionId}-list`} role="listbox" aria-labelledby={`${sectionId}-button`} className="pl-2 -mt-1">
                        <ul className="pr-3">
                            {filteredTags
                                .sort((a, b) =>
                                    a.localeCompare(b, undefined, {
                                        numeric: true,
                                        sensitivity: "base",
                                    })
                                )
                                .map((tagName) => (
                                    <li key={tagName} role="option" aria-selected={tagStates.get(tagName) === "include"} className="flex items-center py-1">
                                        {renderTagCheckbox(tagName)}
                                        <span className="ml-3 pr-4 whitespace-nowrap">{tagName}</span>
                                    </li>
                                ))}
                        </ul>
                    </div>
                )}
            />
        );
    }

    return (
        <>
            {renderTagSection(title, tagMap)}
        </>
    )
}

export default CategoryFilter;