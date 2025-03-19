// Child (sub-component) of left menu

import { MdModeEdit } from "react-icons/md";
import Link from "next/link";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { useEffect, useState } from "react";

const Filters = () => {
    const { tagList, allClasses, updateDisplayClasses } = useCalendarContext();
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (tagList.size > 0) {
            setSelectedTags(new Set(Array.from(tagList.keys())));
        }
    }, [tagList]);

    // Function to update list of tags based on selected tags. It should add a tag to the set if checked and remove if unchecked.
    const updateTags = (event: React.ChangeEvent<HTMLInputElement>) => {
        let newSelectedTags: Set<string>;

        // Handle the "toggle-all" checkbox
        if (event.target.id === "toggle-all") {
            newSelectedTags = event.target.checked
                ? new Set(Array.from(tagList.keys()))
                : new Set();
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

        const newDisplayClasses = newSelectedTags.size > 0
            ? allClasses.filter((classItem) =>
                classItem.classProperties.tags?.some((tag) => newSelectedTags.has(tag))
            )
            : []; // Return empty array when no tags selected
        updateDisplayClasses(newDisplayClasses);
    };

    return (
        <div className="flex flex-col">
            <div className="flex flex-row items-center pb-1">
                <div className="text-bold">Filters</div>
                <Link href={'./tags'}>
                    <button className="rounded-lg px-2"><MdModeEdit className="size-4" /></button>
                </Link>
                <div className="ml-auto">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="toggle-all"
                            className="h-4 w-4 cursor-pointer transition-all appearance-none rounded-sm shadow-sm hover:shadow-md border border-slate-300 checked:bg-blue-600 checked:border-blue-600"
                            checked={selectedTags.size === tagList.size}
                            onChange={updateTags}
                        />
                        <span className="ml-2 text-sm">All</span>
                    </label>
                </div>
            </div>

            {/* Use tagList instead of props */}
            <ul className="pr-3 max-h-[18vh] overflow-y-scroll scrollbar-thin" title="tag-list">
                {Array.from(tagList.entries())
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
                                    onChange={updateTags}
                                />
                            </label>
                            <span className="ml-3 whitespace-nowrap">{tag}</span>
                        </li>
                    ))}
            </ul>

        </div>
    );
}

export default Filters;