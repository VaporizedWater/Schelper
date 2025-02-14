'use client'
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import DropDown from "../DropDown/DropDown";

const TagDisplay = () => {
    const { tagList, allClasses } = useCalendarContext();

    return (
        <div>
            {/* Each tag must be iterated through from tagList*/}
            <ul className="flex flex-col gap-3">
                {Array.from(tagList).map(([tagId, tagData]) => (
                    <li key={tagId} className="">
                        <DropDown
                            title={tagData.tagName + '  : ' + tagData.classIds.size}
                            // List content gets class name from classIds
                            list={Array.from(tagData.classIds).map((id) => {
                                const foundClass = allClasses.find(
                                    (cls) => String(cls.classData._id) === id
                                );
                                const content = foundClass
                                    ? foundClass.classData.title
                                    : id;
                                return {
                                    id,
                                    content,
                                    label: id,
                                    iconUrl: "",
                                    iconAlt: "",
                                    link: "",
                                };
                            })}
                            dropType="list"
                            titleInfo="text-lightblack"
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TagDisplay;