// Filters.tsx

import { BiChevronUp, BiChevronDown, BiCheck, BiMinus } from "react-icons/bi";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { useCallback, useEffect, useState } from "react";
import DropDown from "../DropDown/DropDown";
import { useSearchParams } from "next/navigation";

type TagState = "include" | "neutral" | "exclude";

const cycleState = (current: TagState): TagState => {
    switch (current) {
        case "neutral":
            return "include";
        case "include":
            return "exclude";
        case "exclude":
            return "neutral";
        default:
            return "neutral";
    }
};

const Filters = () => {
    const { tagList, allClasses, updateAllClasses } = useCalendarContext();
    const searchParams = useSearchParams();
    const cohortParam = searchParams.get("cohort");

    // Map each tag string → its tri‐state ('include' / 'neutral' / 'exclude')
    const [tagStates, setTagStates] = useState<Map<string, TagState>>(new Map());

    // Separate maps by category (keys only; values are Set<classId>) so we know which tags belong to which category
    const [cohortTags, setCohortTags] = useState<Map<string, Set<string>>>(new Map());
    const [roomTags, setRoomTags] = useState<Map<string, Set<string>>>(new Map());
    const [instructorTags, setInstructorTags] = useState<Map<string, Set<string>>>(new Map());
    const [levelTags, setLevelTags] = useState<Map<string, Set<string>>>(new Map());
    const [subjectTags, setSubjectTags] = useState<Map<string, Set<string>>>(new Map());
    const [userTags, setUserTags] = useState<Map<string, Set<string>>>(new Map());

    // ---------------------------------------------
    // 1) On initial load (or whenever tagList changes), rebuild category‐maps and initialize all tagStates
    // ---------------------------------------------
    useEffect(() => {
        if (tagList.size === 0) return;

        const newCohort = new Map<string, Set<string>>();
        const newRoom = new Map<string, Set<string>>();
        const newInstructor = new Map<string, Set<string>>();
        const newLevel = new Map<string, Set<string>>();
        const newSubject = new Map<string, Set<string>>();
        const newUser = new Map<string, Set<string>>();

        // Build category maps exactly as before (only include tags that have ≥1 class)
        for (const [tagName, info] of tagList.entries()) {
            const classes = info.classIds;
            if (classes.size === 0) continue;

            switch (info.tagCategory) {
                case "cohort":
                    newCohort.set(tagName, classes);
                    break;
                case "room":
                    newRoom.set(tagName, classes);
                    break;
                case "instructor":
                    newInstructor.set(tagName, classes);
                    break;
                case "level":
                    newLevel.set(tagName, classes);
                    break;
                case "subject":
                    newSubject.set(tagName, classes);
                    break;
                case "user":
                    newUser.set(tagName, classes);
                    break;
                default:
                    break;
            }
        }

        setCohortTags(newCohort);
        setRoomTags(newRoom);
        setInstructorTags(newInstructor);
        setLevelTags(newLevel);
        setSubjectTags(newSubject);
        setUserTags(newUser);

        // Consolidate all keys so we can initialize tagStates
        const allFilteredTags = new Map<string, Set<string>>([
            ...newCohort,
            ...newRoom,
            ...newInstructor,
            ...newLevel,
            ...newSubject,
            ...newUser,
        ]);

        const initialStates = new Map<string, TagState>();

        if (cohortParam && allFilteredTags.has(cohortParam)) {
            // If a valid cohort param exists, that single tag starts as “include,” rest are “neutral”
            for (const key of allFilteredTags.keys()) {
                initialStates.set(key, key === cohortParam ? "include" : "neutral");
            }
        } else {
            // Otherwise default all tags → include (so everything shows by default)
            for (const key of allFilteredTags.keys()) {
                initialStates.set(key, "include");
            }
        }

        setTagStates(initialStates);
        // NOTE: We do NOT call applyFilters(...) here. Instead, a separate useEffect will watch tagStates.
    }, [tagList, cohortParam]);

    // ---------------------------------------------
    // 2) Whenever tagStates changes, re‐compute visible/invisible on every class
    //     (We remove allClasses from this dependency list to avoid loops.)
    // ---------------------------------------------
    useEffect(() => {
        // If tagStates is still empty, do nothing
        if (tagStates.size === 0) return;

        const updated = allClasses.map((cls) => {
            const tags = cls.properties.tags ?? [];

            // 2.a) If any tag on this class is 'exclude', hide it immediately
            const hasExcluded = tags.some((t) => tagStates.get(t.tagName) === "exclude");
            if (hasExcluded) {
                return { ...cls, visible: false };
            }

            // 2.b) Else if any tag is 'include', show it
            const hasIncluded = tags.some((t) => tagStates.get(t.tagName) === "include");
            if (hasIncluded) {
                return { ...cls, visible: true };
            }

            // 2.c) Otherwise (all neutral or no tags), hide it
            return { ...cls, visible: false };
        });

        updateAllClasses(updated);
    }, [tagStates]); // ← only watch tagStates now, not allClasses

    // ---------------------------------------------
    // 3) User clicks a single tag → cycle its state (neutral → include → exclude → neutral)
    // ---------------------------------------------
    const toggleOneTag = useCallback((tag: string) => {
        setTagStates((prev) => {
            const next = new Map(prev);
            const oldState = next.get(tag) ?? "neutral";
            next.set(tag, cycleState(oldState));
            return next;
        });
    }, []);

    // ---------------------------------------------
    // 4) Category “toggle all” (if any in that category ≠ include, set all to include; else set all to neutral)
    // ---------------------------------------------
    const toggleCategoryAll = useCallback(
        (tagMap: Map<string, Set<string>>) => {
            setTagStates((prev) => {
                const next = new Map(prev);

                // Are all tags in this category already “include”?
                const allInclude = Array.from(tagMap.keys()).every((tag) => next.get(tag) === "include");

                for (const tag of tagMap.keys()) {
                    next.set(tag, allInclude ? "neutral" : "include");
                }
                return next;
            });
        },
        []
    );

    // ---------------------------------------------
    // 5) Global “toggle all filters” (if every tag in every category is include, set all → neutral; else set all → include)
    // ---------------------------------------------
    const toggleAllFilters = useCallback(() => {
        setTagStates((prev) => {
            const next = new Map(prev);

            const allTags = [
                ...cohortTags.keys(),
                ...roomTags.keys(),
                ...instructorTags.keys(),
                ...levelTags.keys(),
                ...subjectTags.keys(),
                ...userTags.keys(),
            ];
            // If every single one is “include” right now, we flip them all to “neutral”
            const allInclude = allTags.every((tag) => next.get(tag) === "include");

            for (const tag of allTags) {
                next.set(tag, allInclude ? "neutral" : "include");
            }
            return next;
        });
    }, [cohortTags, roomTags, instructorTags, levelTags, subjectTags, userTags]);

    // ---------------------------------------------
    // 6) Render one tri‐state “checkbox” square for a given tagName
    // ---------------------------------------------
    const renderTagCheckbox = (tagName: string) => {
        const state = tagStates.get(tagName) ?? "neutral";

        // Base classes for the square “checkbox”
        let boxClasses =
            "flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded-sm border " +
            "transition-all ";
        let icon = null;

        if (state === "neutral") {
            // transparent background, gray border
            boxClasses += "border-slate-300 bg-transparent hover:border-slate-400";
        } else if (state === "include") {
            // blue background, checkmark
            boxClasses += "border-blue-600 bg-blue-600";
            icon = <BiCheck className="h-4 w-4 text-white" />;
        } else {
            // exclude: red background, minus sign
            boxClasses += "border-red-600 bg-red-600";
            icon = <BiMinus className="h-4 w-4 text-white" />;
        }

        return (
            <div
                className={boxClasses}
                onClick={() => toggleOneTag(tagName)}
                title={`State: ${state === "include" ? "Include" : state === "exclude" ? "Exclude" : "Neutral"}`}
            >
                {icon}
            </div>
        );
    };

    // ---------------------------------------------
    // 7) Render one category’s dropdown (Cohort, Room, Instructor, etc.)
    // ---------------------------------------------
    const renderTagSection = useCallback(
        (title: string, tagMap: Map<string, Set<string>>) => {
            if (tagMap.size === 0) return null;

            return (
                <DropDown
                    renderButton={(isOpen) => (
                        <span className="font-light text-gray-700 dark:text-gray-300 flex flex-row items-center justify-between">
                            <div className="flex items-center">
                                {/* Category‐level “toggle all” box */}
                                <div
                                    className={
                                        "flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded-sm border " +
                                        "mr-2 transition-all " +
                                        // If every tag in this category is “include,” show a blue check; else transparent border
                                        (Array.from(tagMap.keys()).every((t) => tagStates.get(t) === "include")
                                            ? "border-blue-600 bg-blue-600"
                                            : "border-slate-300 bg-transparent hover:border-slate-400")
                                    }
                                    onClick={() => {
                                        toggleCategoryAll(tagMap);
                                    }}
                                    title={
                                        Array.from(tagMap.keys()).every((t) => tagStates.get(t) === "include")
                                            ? "Deselect all (set all → Neutral)"
                                            : "Select all (set all → Include)"
                                    }
                                >
                                    {Array.from(tagMap.keys()).every((t) => tagStates.get(t) === "include") && (
                                        <BiCheck className="h-4 w-4 text-white" />
                                    )}
                                </div>
                                <div>{title}</div>
                            </div>
                            {isOpen ? <BiChevronUp /> : <BiChevronDown />}
                        </span>
                    )}
                    renderDropdown={() => (
                        <div className="pl-2 -mt-2">
                            <ul className="pr-3" title="tag-list">
                                {Array.from(tagMap.keys())
                                    .sort((a, b) =>
                                        a.localeCompare(b, undefined, {
                                            numeric: true,
                                            sensitivity: "base",
                                        })
                                    )
                                    .map((tag) => (
                                        <li key={tag} className="flex flex-row items-center py-1" title="tag-item">
                                            {/* Our custom tri‐state box */}
                                            {renderTagCheckbox(tag)}
                                            <span className="ml-3 whitespace-nowrap">{tag}</span>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    )}
                    buttonClassName="w-full text-left mt-1"
                    dropdownClassName="relative shadow-none w-full"
                    alwaysOpen={true}
                    darkClass="dark:bg-zinc-800"
                />
            );
        },
        [tagStates, toggleCategoryAll]
    );

    // ---------------------------------------------
    // 8) Final JSX: top‐level “Toggle All Filters” plus each category section
    // ---------------------------------------------
    return (
        <div className="flex flex-col">
            <div className="font-bold text-gray-700 dark:text-gray-300 flex flex-row items-center justify-between py-2">
                <div className="flex flex-row items-center">
                    {/* Top‐level toggle‐all checkbox */}
                    <div
                        className={
                            "flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded-sm border " +
                            "mr-2 transition-all " +
                            // If every tag in *all* categories is “include,” show a blue check; else transparent
                            (
                                [
                                    ...cohortTags.keys(),
                                    ...roomTags.keys(),
                                    ...instructorTags.keys(),
                                    ...levelTags.keys(),
                                    ...subjectTags.keys(),
                                    ...userTags.keys(),
                                ].every((t) => tagStates.get(t) === "include")
                                    ? "border-blue-600 bg-blue-600"
                                    : "border-slate-300 bg-transparent hover:border-slate-400"
                            )
                        }
                        onClick={toggleAllFilters}
                        title={
                            [
                                ...cohortTags.keys(),
                                ...roomTags.keys(),
                                ...instructorTags.keys(),
                                ...levelTags.keys(),
                                ...subjectTags.keys(),
                                ...userTags.keys(),
                            ].every((t) => tagStates.get(t) === "include")
                                ? "Deselect all filters (set every tag → Neutral)"
                                : "Select all filters (set every tag → Include)"
                        }
                    >
                        {[
                            ...cohortTags.keys(),
                            ...roomTags.keys(),
                            ...instructorTags.keys(),
                            ...levelTags.keys(),
                            ...subjectTags.keys(),
                            ...userTags.keys(),
                        ].every((t) => tagStates.get(t) === "include") && (
                                <BiCheck className="h-4 w-4 text-white" />
                            )}
                    </div>
                    <div className="text-bold">Filters</div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {renderTagSection("Cohort", cohortTags)}
                {renderTagSection("Room", roomTags)}
                {renderTagSection("Instructor", instructorTags)}
                {renderTagSection("Level", levelTags)}
                {renderTagSection("Subject", subjectTags)}
                {renderTagSection("User Tags", userTags)}
            </div>
        </div>
    );
};

export default Filters;
