'use client'
import { TagProps } from "@/lib/types";
import { useState } from "react";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { useCalendarContext } from "../CalendarContext/CalendarContext";

const TagDisplay = (props: TagProps) => {
    const [isOpen, setOpen] = useState(false);
    const { tagList } = useCalendarContext();

    // Need to replace the manual dropdown with the existing dropdown component
    return (
        <div className="w-full rounded-md flex flex-col items-center border border-gray-300">
            <ul onClick={() => setOpen((prev) => !prev)} className="flex flex-row w-full cursor-pointer bg-gray-200 hover:bg-gray-300 gap-4 ">
                <li className="flex items-center">
                    {isOpen ? <MdExpandLess /> : <MdExpandMore />}
                </li>

                <li>TagName: {props.tagName}</li>

                {/* Length of classes */}
                <li>Classes: {tagList.get(props.tagName)?.classIds.size ?? 0} </li>
            </ul>

            {isOpen &&
                // Get the classes from the tagList context
                <ul className="flex flex-row gap-3">
                    {[...(tagList.get(props.tagName)?.classIds ?? [])].map((classId) => (
                        <li key={classId}>
                            {classId}
                        </li>
                    ))}
                </ul>
            }
        </div>
    );
}

export default TagDisplay;