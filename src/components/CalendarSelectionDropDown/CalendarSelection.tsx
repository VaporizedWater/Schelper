import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import DropDown from "../DropDown/DropDown";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { useMemo } from "react";

const CalendarDropDown = ({ title }: { title: string }) => {
    const { setContextToOtherCalendar, calendarInfoList } = useCalendarContext();

    const calendarInfoListMap = useMemo(() => {
        console.log(calendarInfoList);

        return calendarInfoList.map((item, index) => (
            <li key={index} className={`${index !== calendarInfoList.length - 1 ? 'border-b border-gray-100 dark:border-gray-500' : ''}`}>
                <button onClick={() => {
                    setContextToOtherCalendar(item._id);
                }} className="block px-4 py-2.5 text-sm">
                    {item.name}
                </button>
            </li>
        ))
    }, [calendarInfoList, setContextToOtherCalendar]);

    return (
        <DropDown
            renderButton={(isOpen) => (
                <div className={`flex items-center gap-2 px-3 py-2 bg-white rounded-full hover:cursor-pointer
                    hover:bg-gray-100 dark:bg-dark dark:hover:bg-zinc-700 transition-all duration-200 
                    shadow-sm hover:shadow border border-gray-200 dark:border-gray-500
                    ${isOpen ? 'bg-gray-100 dark:bg-dark' : ''}`}>
                    <span className="text-sm font-medium">{title}</span>
                    {isOpen ?
                        <IoMdArrowDropup className="size-4 ml-0.5 text-gray-600 dark:text-gray-400" /> :
                        <IoMdArrowDropdown className="size-4 ml-0.5 text-gray-600 dark:text-gray-400" />
                    }
                </div>
            )}
            renderDropdown={() => (
                <ul className="w-full rounded-lg shadow-md border border-gray-200 dark:border-gray-500 bg-white dark:bg-dark hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150 overflow-hidden">
                    {calendarInfoListMap}
                </ul>
            )}
            darkClass="dark:bg-dark"
        />
    );
}

export default CalendarDropDown;