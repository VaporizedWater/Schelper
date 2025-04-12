import { LuFileSpreadsheet } from "react-icons/lu";
import { MdCalendarMonth, MdFileDownload, MdFileUpload } from "react-icons/md";
import { useEffect, useState } from "react";
import { CalendarOpenProps } from "@/lib/types";
import ButtonDropDown from "../ButtonDropDown/ButtonDropDown";
import Link from "next/link";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { AlertTriangleIcon, FacultyIcon } from "@/lib/icons";
import { IoMdSettings } from "react-icons/io";

const CalendarNav = ({ toggleCalendar }: CalendarOpenProps) => {
    const { allClasses } = useCalendarContext();
    const listString: string = "border border-gray-500 duration-50 rounded-full", listString2: string = "border border-gray-500 duration-50 rounded-full";
    const [calendarActive, setActive] = useState(true);

    const whiteClassL: string = "py-2 px-4 hover:bg-gray-200 rounded-l-full", blueClassL: string = whiteClassL + " bg-lightblue";
    const whiteClassR: string = "py-2 px-4 hover:bg-gray-200 rounded-r-full", blueClassR: string = whiteClassR + " bg-lightblue";
    const createDropList = [
        { content: "Class", link: "/classes" },
        { content: "Tag", link: "/addTag" },
        { content: "Faculty", link: "/faculty" },
    ];
    
    return (
        <div className="flex flex-row px-2 ">
            <ul className="flex flex-row items-center">
                {/* Drop down for selecting calendars/semesters*/}
                <li key={1} className={`flex flex-row gap-3 items-center`}>
                    <button className="text-gray-300 hover:text-gray-500 hover:shadow-md rounded-full cursor-pointer">
                        <Link href="/settings" className="">
                            <div className="p-2">
                                <IoMdSettings />
                            </div>
                        </Link>
                    </button>

                    <p className="text-lg text-lightblack text-center font-semibold">Spring 25</p>
                    {/* Show number of classes */}
                    <p className="text-sm text-gray-400">{(() => {
                        const displayClasses = allClasses.filter(cls => cls.visible);
                        return displayClasses.length + " Class" + (displayClasses.length !== 1 ? 'es' : '')
                    })()}</p>
                </li>
            </ul>
            <ul className="ml-auto flex flex-row p-2 gap-2 pl-4 items-center">
                <li key={2} className={`${listString} hover:bg-gray-200`}>
                    <button>
                        <Link href="/viewConflicts" className="flex items-center p-2 bg-white rounded-full hover:bg-gray-200">
                            <AlertTriangleIcon stroke_color="#FFCC00" width="16" height="16" />
                            <div>View Conflicts</div>
                        </Link>
                    </button>
                </li>
                <li key={3} className={`${listString} hover:bg-gray-200`}>
                    <button>
                        <Link href="/exportSheet" className="flex items-center p-2 px-4 bg-white rounded-full hover:bg-gray-200">
                            <MdFileDownload className="size-4 text-gray-600" />
                            <div>Export</div>
                        </Link>
                    </button>
                </li>
                <li key={4} className={`${listString} hover:bg-gray-200`}>
                    <button>
                        <Link href="/importSheet" className="flex items-center p-2 px-4 bg-white rounded-full hover:bg-gray-200">
                            <MdFileUpload className="size-4 text-gray-600" />
                            <div>Import</div>
                        </Link>
                    </button>
                </li>
                <li key={5} className={`${listString} hover:bg-gray-200`}>
                    <ButtonDropDown title="Create" items={createDropList} type="create"></ButtonDropDown>
                </li>
                <li key={6} className={`${listString} hover:bg-gray-200`}>
                    <button>
                        <Link href="/displayFaculty" className="flex items-center p-2 bg-white rounded-full hover:bg-gray-200">
                            <FacultyIcon stroke_color="#3B82F6" width="24" height="24" className="size-4" />
                            <div>Faculty</div>
                        </Link>
                    </button>
                </li>
                <li key={7} className={`${listString2} flex flex-row divide-inherit divide-x-2 divide-solid`}>
                    <button onClick={() => { toggleCalendar(true); setActive(true); }} className={(calendarActive ? blueClassL : whiteClassL)}><MdCalendarMonth className="size-6" /></button>
                    <button onClick={() => { toggleCalendar(false); setActive(false); }} className={(calendarActive ? whiteClassR : blueClassR)}><LuFileSpreadsheet className="size-6" /></button>
                </li>
            </ul>
        </div >
    );
}

export default CalendarNav;
