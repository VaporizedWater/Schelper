import React, { useEffect, useState } from 'react';
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { Class, ClassProperty, CombinedClass } from '@/lib/types';
import { createEventsFromCombinedClass, newDefaultEmptyClass, ShortenedDays } from '@/lib/common';

const ClassProperties = () => {
    const { currentCombinedClass, updateOneClass, allTags } = useCalendarContext();
    const initialData: Class = currentCombinedClass?.data || {} as Class;
    const initialProps: ClassProperty = currentCombinedClass?.properties || {} as ClassProperty;

    const [courseSubject, setCourseSubject] = useState(initialData.course_subject || '');
    const [courseNum, setCourseNum] = useState(initialData.course_num || '');
    const [title, setTitle] = useState(initialData.title || '');
    const [instructor, setInstructor] = useState(initialProps.instructor_name || '');
    const [room, setRoom] = useState(initialProps.room || '');
    const [location, setLocation] = useState(initialData.location || '');
    const [days, setDays] = useState<string[]>(initialProps.days || []);
    const [tags, setTags] = useState<string[]>(Array.isArray(initialProps.tags) ? initialProps.tags : []);
    const [startTime, setStartTime] = useState(initialProps.start_time || '');
    const [endTime, setEndTime] = useState(initialProps.end_time || '');

    useEffect(() => {
        if (currentCombinedClass) {
            const newData = currentCombinedClass.data;
            const newProps = currentCombinedClass.properties;
            setCourseSubject(newData.course_subject || '');
            setCourseNum(newData.course_num || '');
            setTitle(newData.title || '');
            setInstructor(newProps.instructor_name || '');
            setRoom(newProps.room || '');
            setLocation(newData.location || '');
            setDays(newProps.days || []);
            setTags(Array.isArray(newProps.tags) ? newProps.tags : []);
            setStartTime(newProps.start_time || '');
            setEndTime(newProps.end_time || '');
        }
    }, [currentCombinedClass]);

    const handleCourseSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setCourseSubject(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.data.course_subject = newVal;
            updateOneClass(modifiedClass);
        }
    };

    const handleCourseNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setCourseNum(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.data.course_num = newVal;
            updateOneClass(modifiedClass);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setTitle(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.data.title = newVal;
            updateOneClass(modifiedClass);
        }
    };

    const handleInstructorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setInstructor(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.instructor_name = newVal;
            updateOneClass(modifiedClass);
        }
    };

    const handleRoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setRoom(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.room = newVal;
            updateOneClass(modifiedClass);
        }
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setLocation(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.data.location = newVal;
            updateOneClass(modifiedClass);
        }
    };

    const handleDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = Array.from(e.target.selectedOptions, option => option.value);
        setDays(selected);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.days = selected;
            updateOneClass(modifiedClass);
        }
    };

    const handleTagCheck = (tag: string, isChecked: boolean) => {
        const updatedTags = isChecked
            ? [...tags, tag]
            : tags.filter(t => t !== tag);

        setTags(updatedTags);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.tags = updatedTags;
            updateOneClass(modifiedClass);
        }
    };

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setStartTime(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.start_time = newVal;
            modifiedClass.events = createEventsFromCombinedClass(modifiedClass);
            updateOneClass(modifiedClass);
        }
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setEndTime(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.end_time = newVal;
            modifiedClass.events = createEventsFromCombinedClass(modifiedClass);
            updateOneClass(modifiedClass);
        }
    };

    return (
        <div>
            <ul className="flex flex-col w-full">
                <li className="flex border-b items-center">
                    <span className="font-medium text-gray-700 min-w-20">Subject</span>
                    <input
                        type="text"
                        className="flex-1 border px-1 w-full"
                        value={courseSubject}
                        onChange={handleCourseSubjectChange}
                    />
                </li>
                <li className="flex border-b items-center">
                    <span className="font-medium text-gray-700 min-w-20">Number</span>
                    <input
                        type="text"
                        className="flex-1 border px-1 w-full"
                        value={courseNum}
                        onChange={handleCourseNumChange}
                    />
                </li>
                <li className="flex border-b items-center">
                    <span className="font-medium text-gray-700 min-w-20">Title</span>
                    <input
                        type="text"
                        className="flex-1 border px-1 w-full"
                        value={title}
                        onChange={handleTitleChange}
                    />
                </li>
                <li className="flex border-b items-center">
                    <span className="font-medium text-gray-700 min-w-20">Instructor</span>
                    <input
                        type="text"
                        className="flex-1 border px-1 w-full"
                        value={instructor}
                        onChange={handleInstructorChange}
                    />
                </li>
                <li className="flex border-b items-center">
                    <span className="font-medium text-gray-700 min-w-20">Room</span>
                    <input
                        type="text"
                        className="flex-1 border px-1 w-full"
                        value={room}
                        onChange={handleRoomChange}
                    />
                </li>
                <li className="flex border-b items-center">
                    <span className="font-medium text-gray-700 min-w-20">Location</span>
                    <input
                        type="text"
                        className="flex-1 border px-1 w-full"
                        value={location}
                        onChange={handleLocationChange}
                    />
                </li>
                <li className="flex border-b items-center">
                    <span className="font-medium text-gray-700 min-w-20">Days</span>
                    <select
                        multiple
                        className="flex-1 border px-1 w-full overflow-hidden"
                        size={ShortenedDays.length}
                        value={days}
                        onChange={handleDaysChange}
                    >
                        {ShortenedDays.map(day => (
                            <option
                                key={day} value={day} defaultChecked={days.includes(day)}
                                className={`${days.includes(day) ? 'bg-lightblue' : 'bg-white'}`}
                            >
                                {day === "Thu" ? "Th" : day[0]}
                            </option>
                        ))}
                    </select>
                </li>

                {/* Tags to be selected from list of checkboxes */}
                <li className="flex border-b items-center">
                    <span className="font-medium text-gray-700 min-w-20">Tags</span>
                    <div className="flex-1 flex-col gap-2 max-h-[18vh] overflow-y-scroll scrollbar-thin">
                        {Array.from(allTags).map((tag) => {
                            return (
                                <label key={tag} className="flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        checked={tags.includes(tag)}
                                        onChange={(e) => handleTagCheck(tag, e.target.checked)}
                                        className="form-checkbox h-4 w-4 cursor-pointer transition-all appearance-none rounded-sm shadow-sm hover:shadow-md border border-slate-300 checked:bg-blue-600 checked:border-blue-600"
                                    />
                                    <span>{tag}</span>
                                </label>
                            );
                        })}
                    </div>

                </li>

                {/* Start time */}
                <li className="flex border-b items-center">
                    <span className="font-medium text-gray-700 min-w-20">Start Time</span>
                    <input
                        type="time"
                        className="flex-1 border px-1 w-full"
                        value={startTime}
                        onChange={handleStartTimeChange}
                    />
                </li>

                {/* End time */}
                <li className="flex border-b items-center">
                    <span className="font-medium text-gray-700 min-w-20">End Time</span>
                    <input
                        type="time"
                        className="flex-1 border px-1 w-full"
                        value={endTime}
                        onChange={handleEndTimeChange}
                    />
                </li>
            </ul>
        </div>
    );
};

export default ClassProperties;