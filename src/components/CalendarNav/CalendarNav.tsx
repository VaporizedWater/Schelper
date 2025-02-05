import { LuFileSpreadsheet } from "react-icons/lu";
import { MdCalendarMonth } from "react-icons/md";
import { useState } from "react";
import DropDown from "../DropDown/DropDown";
import { CalendarOpenProps } from "@/lib/types";

const CalendarNav = ({ toggleCalendar }: CalendarOpenProps) => {
    const listString: string = "border border-gray-500 duration-50 rounded-full", listString2: string = "border border-gray-500 duration-50 rounded-full";
    const [calendarActive, setActive] = useState(true);

    const whiteClassL: string = "py-2 px-4 hover:bg-gray-200 rounded-l-full", blueClassL: string = whiteClassL + " bg-lightblue";
    const whiteClassR: string = "py-2 px-4 hover:bg-gray-200 rounded-r-full", blueClassR: string = whiteClassR + " bg-lightblue";
    const dropList = [
        { content: "Class", iconUrl: null, iconAlt: null, link: "/classes" },
        { content: "Tag", iconUrl: null, iconAlt: null, link: "/addTag" }
    ];

    return (
        <div className="flex flex-row px-2">
            <ul className="flex flex-row items-center">
                {/* Drop down for selecting calendars/semesters*/}
                <li key={1} className={`flex flex-row gap-2`}>
                    <p className="text-lg text-lightblack text-center font-semibold">Spring 25</p>
                </li>
            </ul>
            <ul className="ml-auto flex flex-row p-2 gap-2 pl-4 items-center">
                <li key={2} className={`${listString} hover:bg-gray-200`}>
                    <DropDown title="Create" list={dropList} dropType="button"></DropDown>
                </li>

                {/* create calendar button somewhere here */}

                <li key={3} className={`${listString2} flex flex-row divide-inherit divide-x-2 divide-solid`}>
                    <button onClick={() => { toggleCalendar(true); setActive(true); }} className={(calendarActive ? blueClassL : whiteClassL)}><MdCalendarMonth className="size-6" /></button>
                    <button onClick={() => { toggleCalendar(false); setActive(false); }} className={(calendarActive ? whiteClassR : blueClassR)}><LuFileSpreadsheet className="size-6" /></button>
                </li>

            </ul>
        </div >
    );
}

export default CalendarNav;