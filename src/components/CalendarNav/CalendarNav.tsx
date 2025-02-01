import { IoCaretDown } from "react-icons/io5";
import { IoMdArrowDropdown, IoMdArrowDropup, IoMdSettings } from "react-icons/io";
import { LuFileSpreadsheet } from "react-icons/lu";
import { MdAdd, MdCalendarMonth } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { IoMenu } from "react-icons/io5";
import Image from "next/image";
import logo from "@/lib/icons";
import { FaChevronLeft } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa6";
import { useState } from "react";
import DropDown from "../DropDown/DropDown";

interface CalendarOpenProps {
    toggleCalendar: (isOpen: boolean) => void;
}
const CalendarNav = ({ toggleCalendar }: CalendarOpenProps) => {
    const listString: string = "border border-gray-500 duration-50 rounded-full";
    // const settingString: string = "opacity-70 duration-100 rounded-full hover:bg-gray-200 flex items-center p-2";
    const [isDropOpen, setDropOpen] = useState(false);
    const [calendarActive, setActive] = useState(true);
    let whiteClassL: string = "py-2 px-4 hover:bg-gray-200 rounded-l-full", blueClassL: string = whiteClassL + " bg-lightblue";
    let whiteClassR: string = "py-2 px-4 hover:bg-gray-200 rounded-r-full", blueClassR: string = whiteClassR + " bg-lightblue";
    let dropList = [
        { content: "Class", iconUrl: null, iconAlt: null, link: "/classes" },
        { content: "Tag", iconUrl: null, iconAlt: null, link: "/addTag" }
    ];

    return (
        <div className="flex flex-row px-2">
            <ul className="flex flex-row items-center">
                {/* Drop down for selecting calendars/semesters*/}
                <li key={5} className={`flex flex-row gap-2`}>
                    <p className="text-lg text-lightblack text-center font-semibold">January 2025</p>
                    <p className="text-lg text-lightblack text-center">SP25</p>
                </li>
            </ul>
            <ul className="ml-auto flex flex-row p-2 gap-2 pl-4 items-center">
                <li key={3} className={`${listString} hover:bg-gray-200`}>
                    <DropDown title="Create" list={dropList} dropType="button"></DropDown>
                </li>

                {/* create4 calendar button somewhere here */}

                <li key={4} className={`${listString} flex flex-row divide-inherit divide-x-2 divide-solid`}>
                    <button onClick={() => { toggleCalendar(true); setActive(true); }} className={(calendarActive ? blueClassL : whiteClassL)}><MdCalendarMonth className="size-6" /></button>
                    <button onClick={() => { toggleCalendar(false); setActive(false); }} className={(calendarActive ? whiteClassR : blueClassR)}><LuFileSpreadsheet className="size-6" /></button>
                </li>

            </ul>
        </div >
    );
}

export default CalendarNav;