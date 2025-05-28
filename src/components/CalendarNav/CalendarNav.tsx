import { LuFileSpreadsheet } from "react-icons/lu";
import { MdCalendarMonth, MdFileDownload, MdFileUpload } from "react-icons/md";
import { useState } from "react";
import { CalendarOpenProps } from "@/lib/types";
import ButtonDropDown from "../ButtonDropDown/ButtonDropDown";
import Link from "next/link";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { AlertTriangleIcon, FacultyIcon } from "@/lib/icons";
import { IoMdSettings } from "react-icons/io";
import CalendarDropDown from "../CalendarSelectionDropDown/CalendarSelection";

const CalendarNav = ({ toggleCalendar }: CalendarOpenProps) => {
    const { displayClasses, currentCalendar } = useCalendarContext();
    // const listString: string = "border border-gray-500 duration-50 rounded-full", listString2: string = "border border-gray-500 duration-50 rounded-full";
    const [calendarActive, setActive] = useState(true);

    const createDropList = [
        { content: "Class", link: "/classes" },
        { content: "Tag", link: "/addTag" },
        { content: "Faculty", link: "/faculty" },
    ];

    const listStyle = "flex items-center gap-2 px-3 py-2 bg-white dark:bg-dark rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all duration-200 shadow-sm hover:shadow border border-gray-200 dark:border-gray-500";

    return (
        <div className="flex flex-row px-2 py-1">
            <ul className="flex flex-row items-center">
                <li key={1} className={`flex flex-row gap-3 items-center`}>
                    <Link href="/settings">
                        <button className="p-2 text-gray-500 dark:text-gray-300 dark:hover:bg-zinc-700 dark:hover:text-gray-200 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-150 cursor-pointer">
                            <IoMdSettings className="size-5" />
                        </button>
                    </Link>
                    {/* <Link href="/faculty">Faculty</Link> */}

                    <CalendarDropDown title={currentCalendar.info.name} />
                    {/* Show number of classes */}
                    <p className="text-sm text-gray-400">{(() => {
                        return displayClasses.length + " Class" + (displayClasses.length !== 1 ? 'es' : '')
                    })()}</p>
                </li>
            </ul>
            <ul className="ml-auto flex flex-row p-2 gap-3 items-center">
                <li key={2}>
                    <Link href="/viewConflicts" className={listStyle}>
                        <AlertTriangleIcon stroke_color="#FFCC00" width="16" height="16" />
                        <span className="text-sm font-medium">View Conflicts</span>
                    </Link>
                </li>
                <li key={3}>
                    <Link href="/exportSheet" className={listStyle}>
                        <MdFileDownload className="size-4 text-gray-600 dark:text-gray-300" />
                        <span className="text-sm font-medium">Export</span>
                    </Link>
                </li>
                <li key={4}>
                    <Link href="/importSheet" className={listStyle}>
                        <MdFileUpload className="size-4 text-gray-600 dark:text-gray-300" />
                        <span className="text-sm font-medium">Import</span>
                    </Link>
                </li>
                <li key={5}>
                    <ButtonDropDown title="Create" items={createDropList} type="create"></ButtonDropDown>
                </li>
                <li key={6}>
                    <Link href="/displayFaculty" className={listStyle}>
                        <FacultyIcon stroke_color="#3B82F6" width="20" height="20" />
                        <span className="text-sm font-medium">Faculty</span>
                    </Link>
                </li>
                <li key={7} className="flex overflow-hidden rounded-full border border-gray-200 dark:border-gray-500 shadow-sm">
                    <button
                        onClick={() => { toggleCalendar(true); setActive(true); }}
                        className={`flex items-center justify-center px-3 py-2 transition-all duration-200 ${calendarActive ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100 dark:bg-dark dark:hover:bg-zinc-700'}`}>
                        <MdCalendarMonth className="size-5" />
                    </button>
                    <button
                        onClick={() => { toggleCalendar(false); setActive(false); }}
                        className={`flex items-center justify-center px-3 py-2 transition-all duration-200 ${!calendarActive ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100 dark:bg-dark dark:hover:bg-zinc-700'}`}>
                        <LuFileSpreadsheet className="size-5" />
                    </button>
                </li>
            </ul>
        </div>
    );
}

export default CalendarNav;
