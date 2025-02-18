import React, { useEffect, useState } from 'react';
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { Class, ClassProperty, CombinedClass } from '@/lib/types';

const ClassProperties = () => {
    const { currCombinedClass, updateCurrentClass } = useCalendarContext();
    const initialData: Class = currCombinedClass?.classData || {} as Class;
    const initialProps: ClassProperty = currCombinedClass?.classProperties || {} as ClassProperty;

    const [courseSubject, setCourseSubject] = useState(initialData.course_subject || '');
    const [courseNum, setCourseNum] = useState(initialData.course_num || '');
    const [title, setTitle] = useState(initialData.title || '');
    const [instructor, setInstructor] = useState(initialProps.instructor_name || '');
    const [days, setDays] = useState<string[]>(initialProps.days || []);
    const [tags, setTags] = useState<string[]>(initialProps.tags || []);

    useEffect(() => {
        if (currCombinedClass) {
            const newData = currCombinedClass.classData;
            const newProps = currCombinedClass.classProperties;
            setCourseSubject(newData.course_subject || '');
            setCourseNum(newData.course_num || '');
            setTitle(newData.title || '');
            setInstructor(newProps.instructor_name || '');
            setDays(newProps.days || []);
            setTags(newProps.tags || []);
        }
    }, [currCombinedClass]);

    const availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const handleCourseSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setCourseSubject(newVal);
        const modifiedClass: CombinedClass = currCombinedClass || {} as CombinedClass;
        modifiedClass.classData.course_subject = newVal;
        updateCurrentClass(modifiedClass);
    };

    const handleCourseNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setCourseNum(newVal);
        const modifiedClass: CombinedClass = currCombinedClass || {} as CombinedClass;
        modifiedClass.classData.course_num = newVal;
        updateCurrentClass(modifiedClass);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setTitle(newVal);
        const modifiedClass: CombinedClass = currCombinedClass || {} as CombinedClass;
        modifiedClass.classData.title = newVal;
        updateCurrentClass(modifiedClass);
    };

    const handleInstructorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setInstructor(newVal);
        const modifiedClass: CombinedClass = currCombinedClass || {} as CombinedClass;
        modifiedClass.classProperties.instructor_name = newVal;
        updateCurrentClass(modifiedClass);
    };

    const handleDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = Array.from(e.target.selectedOptions, option => option.value);
        setDays(selected);
        const modifiedClass: CombinedClass = currCombinedClass || {} as CombinedClass;
        modifiedClass.classProperties.days = selected;
        updateCurrentClass(modifiedClass);
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tagArray = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
        setTags(tagArray);
        const modifiedClass: CombinedClass = currCombinedClass || {} as CombinedClass;
        modifiedClass.classProperties.tags = tagArray;
        updateCurrentClass(modifiedClass);
    };

    return (
        <div>
            <ul className="flex flex-col w-full">
                <li className="flex border-b pb-1">
                    <span className="font-medium text-gray-700 min-w-24">Subject</span>
                    <input
                        type="text"
                        className="flex-1 border p-1"
                        value={courseSubject}
                        onChange={handleCourseSubjectChange}
                    />
                </li>
                <li className="flex border-b pb-1">
                    <span className="font-medium text-gray-700 min-w-24">Number</span>
                    <input
                        type="text"
                        className="flex-1 border p-1"
                        value={courseNum}
                        onChange={handleCourseNumChange}
                    />
                </li>
                <li className="flex border-b pb-1">
                    <span className="font-medium text-gray-700 min-w-24">Title</span>
                    <input
                        type="text"
                        className="flex-1 border p-1"
                        value={title}
                        onChange={handleTitleChange}
                    />
                </li>
                <li className="flex border-b pb-1">
                    <span className="font-medium text-gray-700 min-w-24">Instructor</span>
                    <input
                        type="text"
                        className="flex-1 border p-1"
                        value={instructor}
                        onChange={handleInstructorChange}
                    />
                </li>
                <li className="flex border-b pb-1">
                    <span className="font-medium text-gray-700 min-w-24">Days</span>
                    <select
                        multiple
                        className="flex-1 border p-1"
                        value={days}
                        onChange={handleDaysChange}
                    >
                        {availableDays.map(day => (
                            <option key={day} value={day}>
                                {day}
                            </option>
                        ))}
                    </select>
                </li>
                <li className="flex border-b pb-1">
                    <span className="font-medium text-gray-700 min-w-24">Tags</span>
                    <input
                        type="text"
                        className="flex-1 border p-1"
                        value={tags.join(', ')}
                        onChange={handleTagsChange}
                        placeholder="Comma separated tags"
                    />
                </li>
            </ul>
        </div>
    );
};

export default ClassProperties;
