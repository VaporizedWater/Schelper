import { useEffect, useState } from "react";
import { ClassProperty, CombinedClass, tagType } from "@/lib/types";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { newDefaultEmptyClass } from "@/lib/common";

{/* Tags Section */ }
const Tags = () => {
    const { tagList, currentCombinedClass, updateOneClass } = useCalendarContext();
    const initialProps: ClassProperty = currentCombinedClass?.properties || {} as ClassProperty;
    const [tags, setTags] = useState<tagType[]>(Array.isArray(initialProps.tags) ? initialProps.tags : []);

    useEffect(() => {
        if (currentCombinedClass) {
            const newProps = currentCombinedClass.properties;
            setTags(Array.isArray(newProps.tags) ? newProps.tags : []);
        }
    }, [currentCombinedClass]);

    const handleTagCheck = (tag: tagType, isChecked: boolean) => {
        const updatedTags = isChecked
            ? [...tags, tag]
            : tags.filter(t => t.tagName !== tag.tagName);

        setTags(updatedTags);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.tags = updatedTags;
            updateOneClass(modifiedClass);
        }
    };

    return (
        <div className="h-full w-full overflow-y-auto scrollbar-thin flex flex-col">
            <div className="w-full text-left py-2 font-bold text-gray-700">
                Tags
            </div>
            <div className="h-full">
                {currentCombinedClass?._id ? (
                    <div className="relative w-full pb-4 shadow-none">
                        <div className="flex-1 flex-col gap-2 py-1 pl-1">
                            {Array.from(tagList.keys())
                                .filter(tag => tagList.get(tag)?.tagCategory === "user")
                                .sort((a, b) => a.length - b.length)
                                .map((tag) => (
                                    <label key={tag} className="flex items-center gap-1">
                                        <input
                                            type="checkbox"
                                            checked={tags.map(tag => tag.tagName).includes(tag)}
                                            onChange={(e) => handleTagCheck({ tagName: tag, tagCategory: tagList.get(tag)?.tagCategory || "user" }, e.target.checked)}
                                            className="form-checkbox h-4 w-4 cursor-pointer transition-all appearance-none rounded-sm shadow-sm hover:shadow-md border border-slate-300 checked:bg-blue-600 checked:border-ylue-600"
                                        />
                                        <span>{tag}</span>
                                    </label>
                                ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center text-center h-full text-gray-400 pb-8">
                        <p>Select a class to edit</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Tags;