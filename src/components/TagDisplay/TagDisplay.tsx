'use client'
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import DropDown from "../DropDown/DropDown";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import AddClassToTag from "../AddClassToTag/AddClassToTag";

const TagDisplay = () => {
    const { tagList, allTags, allClasses } = useCalendarContext();

    // Get the IDs of tags that are linked to classes.
    const linkedTagIds = new Set(Array.from(tagList).map(([tagId]) => tagId));

    interface TagObject {
        _id: string;
    }

    // Filter allTags to get unlinked tags; if tag is an object, use its _id as key
    const unlinkedTags = Array.from(allTags).filter((tag: string | TagObject) => {
        // When tag is an object, compare using tag._id; otherwise, use the tag value directly.
        return typeof tag === "object" ? !linkedTagIds.has(tag._id) : !linkedTagIds.has(tag);
    });

    return (
        <div>
            <ul className="flex flex-col gap-3">
                {/* Render linked tags with prefixed key */}
                {Array.from(tagList).map(([tagId, tagData]) => (
                    <li key={`linked-${tagId}`}>
                        <DropDown
                            renderButton={(isOpen) => (
                                <div className="flex justify-between items-center p-2 bg-gray-100 rounded cursor-pointer">
                                    <span>
                                        {tagId} : {tagData.classIds.size} Class
                                        {tagData.classIds.size > 1 ? "es" : ""}
                                    </span>
                                    {isOpen ? <MdExpandLess /> : <MdExpandMore />}
                                </div>
                            )}
                            renderDropdown={() => (
                                <div>
                                    <ul className="flex flex-col gap-1 bg-white border rounded shadow-lg">
                                        {Array.from(tagData.classIds).map((classId) => {
                                            const foundClass = allClasses.find(
                                                (cls) => String(cls.classData._id) === classId
                                            );
                                            return (
                                                <li key={classId} className="p-2 hover:bg-gray-200">
                                                    {foundClass ? foundClass.classData.title : classId}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    {/* AddClassToTag component */}
                                    <AddClassToTag tagId={tagId} />
                                </div>
                            )}
                            buttonClassName="w-full"
                            dropdownClassName="w-full mt-1"
                        />
                    </li>
                ))}
                {unlinkedTags.map((tag: string | TagObject, index) => {
                    const keyValue =
                        typeof tag === "object" && tag._id ? tag._id.toString() : tag.toString();
                    const displayValue =
                        typeof tag === "object" && tag._id ? tag._id.toString() : tag.toString();
                    return (
                        <li key={`unlinked-${keyValue}-${index}`}>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span>{displayValue} : 0 Classes</span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default TagDisplay;