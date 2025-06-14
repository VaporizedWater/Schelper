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
    const navButtonStyle =
        "flex items-center gap-2 px-2 py-2 bg-white dark:bg-dark rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-500";

    return (
        <nav
            role="navigation"
            aria-labelledby="calendar-nav-label"
            className="flex items-center justify-between px-2 py-3"
        >
            {/* Invisible heading for screen readers */}
            <h2 id="calendar-nav-label" className="sr-only">
                Calendar Navigation
            </h2>

            {/* Left side - Calendar selection and info */}
            <div className="flex items-center gap-2">
                <Link href="/settings" aria-label="Open settings" title="Open settings">
                    <button
                        className="p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:text-gray-700 dark:hover:text-gray-200 rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Open settings"
                    >
                        <IoMdSettings title="Settings" aria-hidden="true" className="size-5" />
                    </button>
                </Link>

                <div className="flex items-center gap-3">
                    <CalendarDropDown
                        id="calendar-selector"
                        title={currentCalendar.info.name}
                        aria-label="Select calendar"
                        aria-haspopup="listbox"
                    />

                    <div
                        className="px-2 py-1 bg-gray-100 dark:bg-zinc-700 rounded-lg"
                        aria-live="polite"
                        aria-atomic="true"
                        aria-label="Number of classes displayed"
                    >
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
                            {displayClasses.length} Class
                            {displayClasses.length !== 1 ? "es" : ""}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
                <ButtonDropDown
                    title="New"
                    items={createDropList}
                    type="create"
                    aria-label="Create new item"
                    aria-haspopup="menu"

                />

                <Link
                    href="/viewConflicts"
                    className={navButtonStyle}
                    aria-label="View conflicts"
                    title="View conflicts"
                >
                    <div title="View conflicts">
                        <AlertTriangleIcon

                            aria-hidden="true"
                            stroke_color="#FFCC00"
                            width="16"
                            height="16"
                        />
                    </div>
                </Link>

                <Link
                    href="/exportSheet"
                    className={navButtonStyle}
                    aria-label="Export sheet"
                    title="Export sheet"
                >
                    <MdFileDownload
                        className="size-4 text-gray-600 dark:text-gray-300"
                        title="Export sheet"
                        aria-hidden="true"
                    />
                </Link>

                <Link
                    href="/importSheet"
                    className={navButtonStyle}
                    aria-label="Import sheet"
                    title="Import sheet"
                >
                    <MdFileUpload
                        className="size-4 text-gray-600 dark:text-gray-300"
                        title="Import sheet"
                        aria-hidden="true"
                    />
                </Link>

                {/* View toggle */}
                <div
                    className="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-500 shadow-sm"
                    role="group"
                    aria-label="Toggle calendar or sheet view"
                >
                    <button
                        onClick={() => {
                            toggleCalendar(true);
                            setActive(true);
                        }}
                        className={`flex items-center justify-center p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${calendarActive
                            ? "bg-blue-600 text-white"
                            : "bg-white hover:bg-gray-100 dark:bg-dark dark:hover:bg-zinc-700"
                            }`}
                        aria-label="Calendar view"
                        aria-pressed={calendarActive}
                        aria-current={calendarActive ? "page" : undefined}
                        title="Calendar view"
                    >
                        <MdCalendarMonth
                            className="h-4 w-4"
                            title="Calendar view"
                            aria-hidden="true"
                        />
                    </button>
                    <button
                        onClick={() => {
                            toggleCalendar(false);
                            setActive(false);
                        }}
                        className={`flex items-center justify-center p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${!calendarActive
                            ? "bg-blue-600 text-white"
                            : "bg-white hover:bg-gray-100 dark:bg-dark dark:hover:bg-zinc-700"
                            }`}
                        aria-label="Sheet view"
                        aria-pressed={!calendarActive}
                        aria-current={!calendarActive ? "page" : undefined}
                        title="Sheet view"
                    >
                        <LuFileSpreadsheet
                            className="h-4 w-4"
                            title="Sheet view"
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default CalendarNav;
