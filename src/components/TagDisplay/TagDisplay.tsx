'use client'
import { TagProps } from "@/app/api/types";
import { useState } from "react";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

const TagDisplay = (props: TagProps) => {
    const [isOpen, setOpen] = useState(false);

    return (
        <div className="w-full rounded-md flex flex-col items-center border border-gray-300">
            <ul onClick={() => setOpen((prev) => !prev)} className="flex flex-row w-full cursor-pointer bg-gray-200 hover:bg-gray-300 gap-4 ">
                <li className="flex items-center">
                    {isOpen ? <MdExpandLess /> : <MdExpandMore />}
                </li>

                <li>TagName: {props.tagName}</li>
                <li>Classes: {props.classes.length}</li>
            </ul>

            {isOpen &&
                <ul className="flex flex-row gap-3">
                    {props.classes.map((classItem) => (
                        <li key={classItem}>
                            {classItem}
                        </li>
                    ))}
                </ul>
            }
        </div>
    );
}

export default TagDisplay;