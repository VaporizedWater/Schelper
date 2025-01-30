import { IoCaretDown } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import { LuFileSpreadsheet } from "react-icons/lu";
import { MdCalendarMonth } from "react-icons/md";
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
    const settingString: string = "opacity-70 duration-100 rounded-full hover:bg-gray-200 flex items-center p-2";
    const [isWeekDropOpen, setWeekDropOpen] = useState(false);
    const [calendarActive, setActive] = useState(true);
    let whiteClassL: string = "py-2 px-4 hover:bg-gray-200 rounded-l-full", blueClassL: string = whiteClassL + " bg-lightblue";
    let whiteClassR: string = "py-2 px-4 hover:bg-gray-200 rounded-r-full", blueClassR: string = whiteClassR + " bg-lightblue";

    return (
        <div className="flex flex-row pr-8 pl-4">
            <ul className="flex flex-row gap-2 items-center">
                <li key={1} className={`${settingString} `}>
                    <IoMenu className="size-6" />
                </li>
                <li key={2} className="flex flex-row items-center">
                    <Image src={logo} height={35} alt="Goober Icon" />
                    <p className="font-bold text-lg text-lightblack text-center p-1 mr-3">Goober</p>
                </li>
                <li key={3} className={`${listString} px-6 py-2 hover:bg-gray-200`}>
                    <button onClick={() => { console.log("hi") }} className="">
                        Today
                    </button>
                </li>
                <li key={4} className="flex flex-row">
                    <button onClick={() => { console.log("hi") }} className={`${settingString}`}>
                        <FaChevronLeft className="size-4" />
                    </button>
                    <button onClick={() => { console.log("hi") }} className={`${settingString}`}>
                        <FaChevronRight className="size-4" />
                    </button>
                </li>
                <li key={5} className={`flex flex-row gap-2`}>
                    <p className="text-lg text-lightblack text-center">January 2025</p>
                    <p className="text-lg text-lightblack text-center">SP25</p>
                </li>
            </ul>
            <ul className="ml-auto flex flex-row p-2 gap-2 pl-4 items-center">
                <li key={1} className={`${settingString}`}>
                    <IoSearch className="size-6" />
                </li>
                <li key={2} className={`${settingString}`}>
                    <IoMdSettings className="size-6" />
                </li>
                <li key={3} className={`${listString} px-4 py-2 hover:bg-gray-200 z-100`}>
                    <button onClick={() => setWeekDropOpen((prev) => !prev)} className="flex flex-row items-center gap-2">
                        Week <IoCaretDown className="size-3" />
                    </button>
                    {isWeekDropOpen &&
                        <div className="absolute mt-4 w-fit z-100">
                            <DropDown list={[{ content: "Day", iconAlt: "", iconUrl: "", link: "" }, { content: "Week", iconAlt: "", iconUrl: "", link: "" }, { content: "Month", iconAlt: "", iconUrl: "", link: "" }]} />
                        </div>
                    }
                </li>

                <li key={4} className={`${listString} flex flex-row divide-inherit divide-x-2 divide-solid`}>
                    <button onClick={() => { toggleCalendar(true); setActive(true); }} className={(calendarActive ? blueClassL : whiteClassL)}><MdCalendarMonth className="size-6" /></button>
                    <button onClick={() => { toggleCalendar(false); setActive(false); }} className={(calendarActive ? whiteClassR : blueClassR)}><LuFileSpreadsheet className="size-6" /></button>
                </li>

            </ul>
        </div >
    );
}

export default CalendarNav;