import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import DropDown from "../DropDown/DropDown";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { useMemo } from "react";

interface CalendarDropDownProps {
    id: string;
    title: string;
}

const CalendarDropDown = ({ id, title }: CalendarDropDownProps) => {
    const { setContextToOtherCalendar, calendarInfoList, currentCalendar } = useCalendarContext();

    const calendarInfoListMap = useMemo(
        () =>
            calendarInfoList.filter(c => c._id !== currentCalendar._id).map((item, index) => (
                <li
                    key={index}
                    role="option"
                    aria-selected={item.name === title}
                    className={
                        index !== calendarInfoList.length - 1
                            ? "border-b border-gray-100 dark:border-gray-500"
                            : ""
                    }
                >
                    <button
                        onClick={() => setContextToOtherCalendar(item._id)}
                        className="block w-full text-left px-4 py-2.5 text-sm"
                        role="presentation"
                    >
                        {item.name}
                    </button>
                </li>
            )),
        [calendarInfoList, setContextToOtherCalendar, title] // eslint-disable-line react-hooks/exhaustive-deps
    );

    if (calendarInfoListMap.length === 0) {
        return (
            <div
                id={id}
                className={`flex items-center gap-2 px-2 py-2 bg-white rounded-lg hover:bg-gray-100 dark:bg-dark dark:hover:bg-zinc-700 transition-all duration-200
    shadow-sm hover:shadow border border-gray-200 dark:border-gray-500`}
                role="button"
                aria-labelledby={`${id}-label`}
                tabIndex={0}
            >
                <span id={`${id}-label`} className="text-sm px-1 font-medium">
                    {title}
                </span>
            </div>
        )
    }


    return (
        <DropDown
            id={id}
            renderButton={(isOpen) => (
                <div
                    id={id}
                    className={`flex items-center gap-2 px-2 py-2 bg-white rounded-lg hover:cursor-pointer
            hover:bg-gray-100 dark:bg-dark dark:hover:bg-zinc-700 transition-all duration-200
            shadow-sm hover:shadow border border-gray-200 dark:border-gray-500
            ${isOpen ? "bg-gray-100 dark:bg-dark" : ""}`}
                    role="button"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-labelledby={`${id}-label`}
                    tabIndex={0}
                >
                    <span id={`${id}-label`} className="text-sm pl-1 font-medium">
                        {title}
                    </span>
                    {isOpen ? (
                        <IoMdArrowDropup
                            className="size-4 text-gray-600 dark:text-gray-400"
                            aria-hidden="true"
                        />
                    ) : (
                        <IoMdArrowDropdown
                            className="size-4 text-gray-600 dark:text-gray-400"
                            aria-hidden="true"
                        />
                    )}
                </div>
            )}
            renderDropdown={() =>
            (
                <ul
                    role="listbox"
                    aria-labelledby={`${id}-label`}
                    className="w-full mt-1 rounded-lg shadow-md border border-gray-200 dark:border-gray-500 bg-white dark:bg-dark hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150 overflow-hidden"
                >
                    {calendarInfoListMap}
                </ul>
            )
            }
            darkClass="dark:bg-dark"
        />
    );
};

export default CalendarDropDown;
