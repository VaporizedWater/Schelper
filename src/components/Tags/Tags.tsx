import { useCallback, useEffect, useState } from "react";
import { ClassProperty, CombinedClass, tagType } from "@/lib/types";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { newDefaultEmptyClass } from "@/lib/common";
import { updateCombinedClasses } from "@/lib/DatabaseUtils";

{/* Tags Section */ }
const Tags = () => {
    const { tagList, currentCombinedClass, currentCombinedClasses, currentCalendar } = useCalendarContext();
    const initialProps: ClassProperty = currentCombinedClass?.properties || {} as ClassProperty;
    const [tags, setTags] = useState<tagType[]>(Array.isArray(initialProps.tags) ? initialProps.tags : []);

    useEffect(() => {
        if (currentCombinedClass) {
            const newProps = currentCombinedClass.properties;
            setTags(Array.isArray(newProps.tags) ? newProps.tags : []);
        }
    }, [currentCombinedClass]);

    const handleTagCheck = useCallback((tag: tagType, isChecked: boolean) => {
        const updatedTags = isChecked
            ? [...tags, tag]
            : tags.filter(t => t.tagName !== tag.tagName);

        setTags(updatedTags);
        if (currentCombinedClass && currentCombinedClasses.length > 0) {
            const updatedCombinedClasses: CombinedClass[] = currentCombinedClasses.map(combinedClass => {
                const modifiedClass: CombinedClass = combinedClass || newDefaultEmptyClass();

                modifiedClass.properties.tags = updatedTags;
                return modifiedClass;
            });

            // Update all the classes with the new tags
            updateCombinedClasses(updatedCombinedClasses, currentCalendar._id);


            // const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            // modifiedClass.properties.tags = updatedTags;
            // updateOneClass(modifiedClass);
        }
    }, [currentCombinedClass, tags, updateCombinedClasses, currentCombinedClasses, currentCalendar._id]);

    if (!currentCombinedClass?._id) {
        return (
            <div role="alert" className="flex items-center justify-center text-center h-full text-gray-400 pb-8">
                <p>Select a class to edit</p>
            </div>
        );
    }

    return (
        <div
            id="tags-panel"
            role="region"
            aria-labelledby="tags-panel-title"
            className="h-full w-full overflow-y-auto scrollbar-thin flex flex-col"
        >

            <h2
                id="tags-panel-title"
                className="w-full text-left py-2 font-bold text-gray-700 dark:text-gray-300"
            >
                Tags
            </h2>

            <fieldset id="tags-fieldset" className="flex-1 flex-col gap-2 py-1 pl-1" aria-required="false">
                <legend className="sr-only">Select tags to apply to the class</legend>
                {Array.from(tagList.keys())
                    .filter(tag => tagList.get(tag)?.tagCategory === "user")
                    .sort((a, b) => a.length - b.length)
                    .map((tag) => {
                        const isChecked = tags.some((t) => t.tagName === tag);
                        const tagCategory = tagList.get(tag)?.tagCategory || "user";
                        const inputId = `tag-checkbox-${tag}`;

                        return (
                            <div key={tag} className="flex items-center gap-1">
                                <input
                                    id={inputId}
                                    name="tags"
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => handleTagCheck({ tagName: tag, tagCategory }, e.target.checked)}
                                    className="form-checkbox h-4 w-4 cursor-pointer transition-all appearance-none rounded-sm shadow-sm hover:shadow-md border border-slate-300 checked:bg-blue-600 checked:border-blue-600"
                                    aria-checked={isChecked}
                                />
                                <label htmlFor={inputId} className="cursor-pointer">{tag}</label>
                            </div>
                        );
                    })}
            </fieldset>
        </div>
    );
}

export default Tags;