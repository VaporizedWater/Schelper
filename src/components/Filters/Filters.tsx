// Child (sub-component) of left menu

import { MdModeEdit } from "react-icons/md";
import { BiChevronUp, BiChevronDown } from "react-icons/bi";
import Link from "next/link";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { useEffect, useState } from "react";
import DropDown from "../DropDown/DropDown";
import { useSearchParams } from "next/navigation";

const Filters = () => {
    const { tagList, allClasses, updateAllClasses } = useCalendarContext();
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const searchParams = useSearchParams();
    const cohortParam = searchParams.get('cohort');

    // Replace single filterTags with category-specific maps
    const [cohortTags, setCohortTags] = useState<Map<string, Set<string>>>(new Map());
    const [roomTags, setRoomTags] = useState<Map<string, Set<string>>>(new Map());
    const [instructorTags, setInstructorTags] = useState<Map<string, Set<string>>>(new Map());
    const [levelTags, setLevelTags] = useState<Map<string, Set<string>>>(new Map());
    const [subjectTags, setSubjectTags] = useState<Map<string, Set<string>>>(new Map());
    const [userTags, setUserTags] = useState<Map<string, Set<string>>>(new Map());

    useEffect(() => {
        if (tagList.size > 0) {
            // Create new maps for each category
            const newCohortTags = new Map();
            const newRoomTags = new Map();
            const newInstructorTags = new Map();
            const newLevelTags = new Map();
            const newSubjectTags = new Map();
            const newUserTags = new Map();

            // Iterate through each tag in tagList
            for (const [tag, tagCategoryAndClasses] of tagList.entries()) {
                const classes = tagCategoryAndClasses.classIds;
                // Only include tags that have associated classes
                if (classes.size > 0) {
                    // Sort into appropriate category
                    switch (tagCategoryAndClasses.tagCategory) {
                        case "cohort":
                            newCohortTags.set(tag, classes);
                            break;
                        case "room":
                            newRoomTags.set(tag, classes);
                            break;
                        case "instructor":
                            newInstructorTags.set(tag, classes);
                            break;
                        case "level":
                            newLevelTags.set(tag, classes);
                            break;
                        case "subject":
                            newSubjectTags.set(tag, classes);
                            break;
                        case "user":
                            newUserTags.set(tag, classes);
                            break;
                        // Other categories could be added as needed
                    }
                }
            }

            // Update state for each category
            setCohortTags(newCohortTags);
            setRoomTags(newRoomTags);
            setInstructorTags(newInstructorTags);
            setLevelTags(newLevelTags);
            setSubjectTags(newSubjectTags);
            setUserTags(newUserTags);

            // Handle cohort parameter from URL if present
            const allFilteredTags = new Map([
                ...newCohortTags, ...newRoomTags, ...newInstructorTags, ...newLevelTags, ...newSubjectTags, ...newUserTags
            ]);

            // Use newFilteredTags (not filterTags) since the state update hasn't processed yet
            if (cohortParam && Array.from(allFilteredTags.keys()).includes(cohortParam)) {
                // Only select the cohort tag in the UI
                setSelectedTags(new Set([cohortParam]));
            } else {
                // Default behavior: select all tags from filtered tags
                setSelectedTags(new Set(Array.from(allFilteredTags.keys())));
            }
        }
    }, [tagList, cohortParam]);

    // Function to update list of tags based on selected tags
    const updateTags = (event: React.ChangeEvent<HTMLInputElement>, tagMap: Map<string, Set<string>>) => {
        let newSelectedTags: Set<string>;
        const mapTags = Array.from(tagMap.keys());

        // Handle the "toggle-all" checkbox
        if (event.target.id.endsWith("-toggle-all")) {  // Check for IDs ending with "-toggle-all"
            // Get currently selected tags (excluding those from the current category)
            const otherSelectedTags = Array.from(selectedTags).filter(tag => !mapTags.includes(tag));

            // If checking "Select All", add all tags from this category
            newSelectedTags = event.target.checked
                ? new Set([...otherSelectedTags, ...mapTags])
                : new Set(otherSelectedTags);
        } else {
            // Handle individual tag checkboxes
            newSelectedTags = new Set(selectedTags);
            if (event.target.checked) {
                newSelectedTags.add(event.target.id);
            } else {
                newSelectedTags.delete(event.target.id);
            }
        }

        setSelectedTags(newSelectedTags);

        const updatedClasses = allClasses.map((cls) => {
            const isVisible = cls.properties.tags?.some((tag) => newSelectedTags.has(tag.tagName));
            return {
                ...cls,
                visible: isVisible
            };
        });

        updateAllClasses(updatedClasses);
    };

    // Add a function to handle toggling all filters at once
    const toggleAllFilters = (event: React.ChangeEvent<HTMLInputElement>) => {
        const allTags = new Map([
            ...cohortTags, ...roomTags, ...instructorTags, ...levelTags, ...subjectTags, ...userTags
        ]);

        // Either select all or clear all based on checkbox state
        const newSelectedTags: Set<string> = event.target.checked
            ? new Set(Array.from(allTags.keys()))
            : new Set();

        setSelectedTags(newSelectedTags);

        const updatedClasses = allClasses.map((cls) => {
            const isVisible = cls.properties.tags?.some((tag) => newSelectedTags.has(tag.tagName));
            return {
                ...cls,
                visible: isVisible
            };
        });

        updateAllClasses(updatedClasses);
    };

    // Helper function to render a tag category dropdown
    const renderTagSection = (
        title: string,
        tagMap: Map<string, Set<string>>,
        categoryId: string
    ) => (
        <DropDown
            renderButton={(isOpen) => (
                <span className="font-light text-gray-700 flex flex-row items-center justify-between">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id={`${categoryId}-toggle-all`}
                            className="h-4 w-4 mr-2 cursor-pointer transition-all appearance-none rounded-sm shadow-sm hover:shadow-md border border-slate-300 checked:bg-blue-400 checked:border-blue-400"
                            checked={Array.from(tagMap.keys()).every(tag => selectedTags.has(tag))}
                            onChange={(e) => updateTags(e, tagMap)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        />
                        <div>{title}</div>
                    </div>
                    {isOpen ? <BiChevronUp /> : <BiChevronDown />}
                </span>
            )}
            renderDropdown={() => (
                <div className="pl-2">
                    <ul className="pr-3" title="tag-list">
                        {Array.from(tagMap.entries())
                            .sort((a, b) => a[0].localeCompare(b[0], undefined, {
                                numeric: true,
                                sensitivity: 'base'
                            }))
                            .map(([tag]) => (
                                <li key={tag} className="flex flex-row items-center" title="tag-item">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name={tag}
                                            id={tag}
                                            className="h-4 w-4 cursor-pointer transition-all appearance-none rounded-sm shadow-sm hover:shadow-md border border-slate-300 checked:bg-blue-600 checked:border-blue-600"
                                            checked={selectedTags.has(tag)}
                                            onChange={(e) => updateTags(e, tagMap)}
                                        />
                                    </label>
                                    <span className="ml-3 whitespace-nowrap">{tag}</span>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
            buttonClassName="w-full text-left mt-1"
            dropdownClassName="relative shadow-none w-full"
            alwaysOpen={true}
        />
    );

    return (
        <div className="flex flex-col">
            <div className="font-bold text-gray-700 flex flex-row items-center justify-between py-2">
                <div className="flex flex-row items-center">
                    <input
                        type="checkbox"
                        id="toggle-all-filters"
                        className="h-4 w-4 mr-2 cursor-pointer transition-all appearance-none rounded-sm shadow-sm hover:shadow-md border border-slate-300 checked:bg-blue-200 checked:border-blue-200"
                        checked={selectedTags.size > 0 && selectedTags.size === Array.from(new Map([
                            ...cohortTags, ...roomTags, ...instructorTags, ...levelTags, ...subjectTags, ...userTags
                        ]).keys()).length}
                        onChange={toggleAllFilters}
                    />
                    <div className="text-bold">Filters</div>
                    <Link href={'./tags'}>
                        <div className="rounded-lg px-2"><MdModeEdit className="size-4" /></div>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {/* Cohort */}
                {cohortTags.size > 0 && renderTagSection("Cohort", cohortTags, "cohort")}

                {/* Room */}
                {roomTags.size > 0 && renderTagSection("Room", roomTags, "room")}

                {/* Instructor */}
                {instructorTags.size > 0 && renderTagSection("Instructor", instructorTags, "instructor")}

                {/* Level */}
                {levelTags.size > 0 && renderTagSection("Level", levelTags, "level")}

                {/* Subject */}
                {subjectTags.size > 0 && renderTagSection("Subject", subjectTags, "subject")}

                {/* User Tags */}
                {userTags.size > 0 && renderTagSection("User Tags", userTags, "user")}
            </div>
        </div>
    );
}

export default Filters;