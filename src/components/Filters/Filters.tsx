// Filters.tsx

import { BiChevronUp, BiChevronDown, BiCheck, BiMinus } from "react-icons/bi";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { useCallback, useEffect, useState, KeyboardEvent } from "react";
import DropDown from "../DropDown/DropDown";
import { useSearchParams } from "next/navigation";

type TagState = "include" | "neutral" | "exclude";

// Cycle: neutral → include → exclude → neutral …
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

    // Each tagName → "include" | "neutral" | "exclude"
    const [tagStates, setTagStates] = useState<Map<string, TagState>>(new Map());

    // Category‐specific maps: tagName → Set<classId>
    const [cohortTags, setCohortTags] = useState<Map<string, Set<string>>>(new Map());
    const [roomTags, setRoomTags] = useState<Map<string, Set<string>>>(new Map());
    const [instructorTags, setInstructorTags] = useState<Map<string, Set<string>>>(new Map());
    const [levelTags, setLevelTags] = useState<Map<string, Set<string>>>(new Map());
    const [subjectTags, setSubjectTags] = useState<Map<string, Set<string>>>(new Map());
    const [userTags, setUserTags] = useState<Map<string, Set<string>>>(new Map());

    // ───────────────────────────────────────────────────────────
    // 1) Build category maps and initialize all tagStates on load / tagList change
    // ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (tagList.size === 0) return;

        const newCohort = new Map<string, Set<string>>();
        const newRoom = new Map<string, Set<string>>();
        const newInstructor = new Map<string, Set<string>>();
        const newLevel = new Map<string, Set<string>>();
        const newSubject = new Map<string, Set<string>>();
        const newUser = new Map<string, Set<string>>();

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
            }
        }

        setCohortTags(newCohort);
        setRoomTags(newRoom);
        setInstructorTags(newInstructor);
        setLevelTags(newLevel);
        setSubjectTags(newSubject);
        setUserTags(newUser);

        // Consolidate every tagName so we can set initial states
        const allKeys = new Map<string, Set<string>>([
            ...newCohort,
            ...newRoom,
            ...newInstructor,
            ...newLevel,
            ...newSubject,
            ...newUser,
        ]);

        const initial = new Map<string, TagState>();
        if (cohortParam && allKeys.has(cohortParam)) {
            // Only that one cohort starts as "include"; others are "neutral"
            for (const name of allKeys.keys()) {
                initial.set(name, name === cohortParam ? "include" : "neutral");
            }
        } else {
            // Everything defaults to "include"
            for (const name of allKeys.keys()) {
                initial.set(name, "include");
            }
        }
        setTagStates(initial);
        // (No applyFilters here; a separate effect will watch tagStates.)
    }, [tagList, cohortParam]);

    // ───────────────────────────────────────────────────────────
    // 2) Whenever tagStates changes, recompute each class’s visibility
    //    (Don’t depend on allClasses, to avoid an infinite loop.)
    // ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (tagStates.size === 0) return;

        const updated = allClasses.map((cls) => {
            const tags = cls.properties.tags ?? [];

            // 2.a) If any tag on this class is "exclude", hide immediately
            if (tags.some((t) => tagStates.get(t.tagName) === "exclude")) {
                return { ...cls, visible: false };
            }
            // 2.b) Else if any tag is "include", show it
            if (tags.some((t) => tagStates.get(t.tagName) === "include")) {
                return { ...cls, visible: true };
            }
            // 2.c) Otherwise, hide it (all neutral or no tags)
            return { ...cls, visible: false };
        });

        updateAllClasses(updated);
    }, [tagStates]); // eslint-disable-line react-hooks/exhaustive-deps

    // ───────────────────────────────────────────────────────────
    // 3) Cycle a single tag’s state: neutral → include → exclude → neutral
    // ───────────────────────────────────────────────────────────
    const toggleOneTag = useCallback((tagName: string) => {
        setTagStates((prev) => {
            const next = new Map(prev);
            const oldState = next.get(tagName) ?? "neutral";
            next.set(tagName, cycleState(oldState));
            return next;
        });
    }, []);

    // Support keyboard toggling on each tag checkbox
    const handleTagKeyDown = (e: KeyboardEvent, tagName: string) => {
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggleOneTag(tagName);
        }
    };

    // ───────────────────────────────────────────────────────────
    // 4) Category‐level "toggle all"
    // ───────────────────────────────────────────────────────────
    const toggleCategoryAll = useCallback(
        (tagMap: Map<string, Set<string>>) => {
            setTagStates((prev) => {
                const next = new Map(prev);
                const allInclude = Array.from(tagMap.keys()).every((t) => next.get(t) === "include");
                for (const tagName of tagMap.keys()) {
                    next.set(tagName, allInclude ? "neutral" : "include");
                }
                return next;
            });
        },
        []
    );

    // ───────────────────────────────────────────────────────────
    // 5) Global "toggle all filters"
    // ───────────────────────────────────────────────────────────
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
            const allInclude = allTags.every((t) => next.get(t) === "include");
            for (const tagName of allTags) {
                next.set(tagName, allInclude ? "neutral" : "include");
            }
            return next;
        });
    }, [cohortTags, roomTags, instructorTags, levelTags, subjectTags, userTags]);

    // ───────────────────────────────────────────────────────────
    // 6) Render one fixed-size tri-state “checkbox”
    // ───────────────────────────────────────────────────────────
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

    // ───────────────────────────────────────────────────────────
    // 7) Render one category’s dropdown section
    // ───────────────────────────────────────────────────────────
    const renderTagSection = useCallback(
        (title: string, tagMap: Map<string, Set<string>>) => {
            if (tagMap.size === 0) return null;

            // derive a stable ID for this category
            const sectionId = `filter-${title.toLowerCase().replace(/\s+/g, "-")}`;

            // check if all in this category are included
            const allIncluded = Array.from(tagMap.keys()).every((t) => tagStates.get(t) === "include");

            return (
                <DropDown
                    id={sectionId}
                    label={`${title} filters`}
                    alwaysOpen={false}
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
                            className="font-light text-gray-700 dark:text-gray-300 flex items-center justify-between"
                            title={`${title} filters: ${allIncluded ? "All included" : "Not all included"}`}
                        >
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
                                <span>{title}</span>
                            </div>
                            {isOpen ? <BiChevronUp aria-hidden="true" /> : <BiChevronDown aria-hidden="true" />}
                        </div>
                    )}
                    renderDropdown={() => (
                        <div id={`${sectionId}-list`} role="listbox" aria-labelledby={`${sectionId}-button`} className="pl-2 -mt-1">
                            <ul className="pr-3">
                                {Array.from(tagMap.keys())
                                    .sort((a, b) =>
                                        a.localeCompare(b, undefined, {
                                            numeric: true,
                                            sensitivity: "base",
                                        })
                                    )
                                    .map((tagName) => (
                                        <li key={tagName} role="option" aria-selected={tagStates.get(tagName) === "include"} className="flex items-center py-1">
                                            {renderTagCheckbox(tagName)}
                                            <span className="ml-3 whitespace-nowrap">{tagName}</span>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    )}
                />
            );
        },
        [tagStates, toggleCategoryAll] // eslint-disable-line react-hooks/exhaustive-deps
    );

    // ───────────────────────────────────────────────────────────
    // 8) Final JSX: Top‐level “Toggle All Filters” + each category section
    // ───────────────────────────────────────────────────────────
    // derive if everything is included
    const allTags = [
        ...cohortTags.keys(),
        ...roomTags.keys(),
        ...instructorTags.keys(),
        ...levelTags.keys(),
        ...subjectTags.keys(),
        ...userTags.keys(),
    ];
    const allIncluded = allTags.every((t) => tagStates.get(t) === "include");

    return (
        <section aria-labelledby="filters-heading" className="flex flex-col">
            <h2 id="filters-heading" className="sr-only">
                Filters
            </h2>

            <div className="font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between py-2">
                <div className="flex items-center">
                    {/* Top‐level “toggle all filters” box */}
                    <div
                        role="button"
                        aria-pressed={allIncluded}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                                e.preventDefault();
                                toggleAllFilters();
                            }
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleAllFilters();
                        }}
                        className={
                            "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border mr-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 " +
                            (allIncluded
                                ? "border-blue-600 bg-blue-600"
                                : "border-slate-300 bg-transparent hover:border-slate-400")
                        }
                        title={allIncluded ? "Deselect all filters" : "Select all filters"}
                        aria-label={allIncluded ? "Deselect all filters" : "Select all filters"}
                    >
                        {allIncluded ? (
                            <BiCheck className="h-4 w-4 text-white" aria-hidden="true" />
                        ) : (
                            <span className="h-4 w-4 block opacity-0" aria-hidden="true" />
                        )}
                    </div>
                    <span className="text-lg">Filters</span>
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
        </section>
    );
};

export default Filters;
