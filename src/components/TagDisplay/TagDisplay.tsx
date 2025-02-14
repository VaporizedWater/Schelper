'use client'
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import DropDown from "../DropDown/DropDown";
import { MdExpandLess, MdExpandMore } from "react-icons/md";

const TagDisplay = () => {
    const { tagList, allClasses } = useCalendarContext();

    return (
        <div>
            {/* Each tag must be iterated through from tagList */}
            <ul className="flex flex-col gap-3">
                {Array.from(tagList).map(([tagId, tagData]) => (
                    <li key={tagId}>
                        <DropDown
                            renderButton={(isOpen) => (
                                <div className="flex justify-between items-center p-2 bg-gray-100 rounded cursor-pointer">
                                    <span>{tagData.tagName} : {tagData.classIds.size}</span>
                                    {isOpen ? <MdExpandLess /> : <MdExpandMore />}
                                </div>
                            )}
                            renderDropdown={() => (
                                <ul className="flex flex-col gap-1 bg-white border rounded shadow-lg">
                                    {Array.from(tagData.classIds).map((id) => {
                                        const foundClass = allClasses.find(
                                            (cls) => String(cls.classData._id) === id
                                        );
                                        const content = foundClass
                                            ? foundClass.classData.title
                                            : id;
                                        return (
                                            <li key={id} className="p-2 hover:bg-gray-200">
                                                {content}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                            buttonClassName="w-full"
                            dropdownClassName="w-full mt-1"
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TagDisplay;