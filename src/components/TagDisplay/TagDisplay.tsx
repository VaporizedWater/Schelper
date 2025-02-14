'use client'
import { useState } from "react";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import DropDown from "../DropDown/DropDown";

const TagDisplay = () => {
    const { tagList } = useCalendarContext();

    return (
        <div>
            {/* Each tag must be iterated through from tagList*/}
            <ul className="flex flex-col gap-3">
                {Array.from(tagList).map(([tagId, tagData]) => (
                    <li key={tagId} className="">
                        <DropDown
                            title={tagData.tagName}
                            list={Array.from(tagData.classIds).map(id => ({ id, content: id, label: id, iconUrl: '', iconAlt: '', link: '' }))}
                            dropType="list"
                            titleInfo="text-lightblack"
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TagDisplay;