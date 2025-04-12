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

    useEffect(() => {
        if (tagList.size > 0) {
            // If there's a cohort parameter and it exists in tagList
            if (cohortParam && Array.from(tagList.keys()).includes(cohortParam)) {
                // Only select the cohort tag in the UI
                setSelectedTags(new Set([cohortParam]));
            } else {
                // Default behavior: select all tags
                setSelectedTags(new Set(Array.from(tagList.keys())));
            }
        }
    }, [tagList, cohortParam]);

    // Function to update list of tags based on selected tags
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

        const updatedClasses = allClasses.map((cls) => {
            const isVisible = cls.properties.tags?.some((tag) => newSelectedTags.has(tag));
            return {
                ...cls,
                visible: isVisible
            };
        });

        updateAllClasses(updatedClasses);
    };

    return (
        <div className="flex flex-col">
            <DropDown
                renderButton={(isOpen) => (
                    <span className="font-bold text-gray-700 flex flex-row items-center justify-between">
                        <div className="flex flex-row items-center justify-between">
                            <div className="text-bold">Filters</div>
                            <Link href={'./tags'}>
                                <div className="rounded-lg px-2"><MdModeEdit className="size-4" /></div>
                            </Link>
                        </div>
                        {isOpen ? <BiChevronUp /> : <BiChevronDown />}
                    </span>
                )}
                renderDropdown={() => (
                    <div className="pl-1">
                        <div className=" flex justify-end">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="toggle-all"
                                    className="h-4 w-4 cursor-pointer transition-all appearance-none rounded-sm shadow-sm hover:shadow-md border border-slate-300 checked:bg-blue-600 checked:border-blue-600"
                                    checked={selectedTags.size === tagList.size}
                                    onChange={updateTags}
                                />
                                <span className="p-2 text-sm">Select All</span>
                            </label>
                        </div>

                        <ul className="pr-3 max-h-[20vh] overflow-y-auto scrollbar-thin" title="tag-list">
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
                )}
                buttonClassName="w-full text-left mt-1"
                dropdownClassName="relative shadow-none w-full"
                alwaysOpen={true}
            />
        </div>
    );
}

export default Filters;