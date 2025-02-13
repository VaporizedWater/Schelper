// Child (sub-component) of left menu

import { MdModeEdit } from "react-icons/md";
import Link from "next/link";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { useEffect, useState } from "react";
import { EventInput } from "@fullcalendar/core/index.js";

const Filters = () => {
    const { tagList, allClasses, updateDisplayClasses, updateDisplayEvents } = useCalendarContext();
    const [selectedTags, setSelectedTags] = useState<Set<string>>(
        new Set(Array.from(tagList.keys()))
    );

    useEffect(() => {
        if (tagList.size > 0) {
            setSelectedTags(new Set(Array.from(tagList.keys())));
        }
    }, [tagList]);

    // Function to update list of tags based on selected tags. It should add a tag to the set if checked and remove if unchecked.
    const updateTags = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSelectedTags = new Set(selectedTags);
        if (event.target.checked) {
            newSelectedTags.add(event.target.id);
        } else {
            newSelectedTags.delete(event.target.id);
        }

        setSelectedTags(newSelectedTags);

        // Display selected tags in console by expanding the set to an array
        console.log("Selected tags: ", Array.from(newSelectedTags));

        // update display classes based on selected tags using tagList from context
        // Filter allClasses so that each class has at least one tag from the selected tag set.
        const newDisplayClasses = allClasses.filter((classItem) =>
            classItem.classProperties.tags.some((tag) => newSelectedTags.has(tag.id))
        );
        updateDisplayClasses(newDisplayClasses);

        // Update display events as well
        updateDisplayEvents(newDisplayClasses.map((item) => item.event as EventInput));

        console.log("Display classes: ", newDisplayClasses);
    };


    return (
        <div className="flex flex-col min-w-fit h-full max-h-[30vh]">
            <div className="flex flex-row items-center pb-1">
                <div className="text-bold">My&nbsp;Tags</div>
                <Link href={'./tags'}>
                    <button className="rounded-lg px-2"><MdModeEdit className="size-4" /></button>
                </Link>

            </div>

            {/* Use tagList instead of props */}
            <ul className="overflow-y-scroll scrollbar-webkit scrollbar-thin pr-3" title="tag-list">
                {Array.from(tagList.entries()).map(([id, { tagName }]) => (
                    <li key={id} className="flex flex-row items-center" title="tag-item">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name={tagName}
                                id={id}
                                className="h-4 w-4 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-blue-600 checked:border-blue-600"
                                defaultChecked={true}
                                onChange={updateTags}
                            />
                        </label>
                        <span className="ml-3 whitespace-nowrap">{tagName}</span>
                    </li>
                ))}
            </ul>

        </div>
    );
}

export default Filters;