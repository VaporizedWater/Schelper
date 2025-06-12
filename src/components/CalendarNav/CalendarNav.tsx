import { LuFileSpreadsheet } from "react-icons/lu";
import { MdCalendarMonth, MdFileDownload, MdFileUpload } from "react-icons/md";
import { useState } from "react";
import { CalendarOpenProps } from "@/lib/types";
import ButtonDropDown from "../ButtonDropDown/ButtonDropDown";
import Link from "next/link";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { AlertTriangleIcon } from "@/lib/icons";
import { IoMdSettings } from "react-icons/io";
import CalendarDropDown from "../CalendarSelectionDropDown/CalendarSelection";

const CalendarNav = ({ toggleCalendar }: CalendarOpenProps) => {
    const { displayClasses, currentCalendar } = useCalendarContext();
    const [calendarActive, setActive] = useState(true);

    const createDropList = [
        { content: "Class", link: "/classes" },
        { content: "Tag", link: "/addTag" },
        { content: "Faculty", link: "/faculty" },
    ];

    // Updated styling for better consistency
    const navButtonStyle = "flex items-center gap-2 px-2 py-2 bg-white dark:bg-dark rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-500";

    return (
        <div className="flex items-center justify-between px-2 py-3">
            {/* Left side - Calendar selection and info */}
            <div className="flex items-center gap-2">
                <Link href="/settings">
                    <button className="p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-700 dark:hover:text-gray-200 rounded-full transition-all duration-150">
                        <IoMdSettings className="size-5" />
                    </button>
                </Link>

                <div className="flex items-center gap-3">
                    <CalendarDropDown title={currentCalendar.info.name} />
                    <div className="px-2 py-1 bg-gray-100 dark:bg-zinc-700 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
                            {displayClasses.length} Class{displayClasses.length !== 1 ? 'es' : ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
                <ButtonDropDown title="New" items={createDropList} type="create"></ButtonDropDown>

                <Link href="/viewConflicts" className={navButtonStyle}>
                    <AlertTriangleIcon stroke_color="#FFCC00" width="16" height="16" />
                </Link>

                {/* <Link href="/displayFaculty" className={navButtonStyle}>
                    <FacultyIcon stroke_color="#3B82F6" width="18" height="18" />
                    <span className="text-sm font-medium">Faculty</span>
                </Link> */}

                <Link href="/exportSheet" className={navButtonStyle}>
                    <MdFileDownload className="size-4 text-gray-600 dark:text-gray-300" />
                </Link>

                <Link href="/importSheet" className={navButtonStyle}>
                    <MdFileUpload className="size-4 text-gray-600 dark:text-gray-300" />
                </Link>


                {/* View toggle */}
                <div className="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-500 shadow-sm">
                    <button
                        onClick={() => { toggleCalendar(true); setActive(true); }}
                        className={`flex items-center justify-center p-2 transition-all duration-200 ${calendarActive ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100 dark:bg-dark dark:hover:bg-zinc-700'}`}
                        aria-label="Calendar view"
                    >
                        <MdCalendarMonth className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => { toggleCalendar(false); setActive(false); }}
                        className={`flex items-center justify-center p-2 transition-all duration-200 ${!calendarActive ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100 dark:bg-dark dark:hover:bg-zinc-700'}`}
                        aria-label="Sheet view"
                    >
                        <LuFileSpreadsheet className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CalendarNav;
