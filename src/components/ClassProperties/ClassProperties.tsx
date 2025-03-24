import React, { useEffect, useState } from 'react';
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { Class, ClassProperty, CombinedClass } from '@/lib/types';
import { createEventsFromCombinedClass, newDefaultEmptyClass, ShortenedDays } from '@/lib/common';
import { BiChevronUp, BiChevronDown } from 'react-icons/bi';
import DropDown from '../DropDown/DropDown';

const ClassProperties = () => {
    const { currentCombinedClass, updateOneClass, allTags, deleteClasses, setCurrentClass } = useCalendarContext();
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

    const handleDaysChange = (day: string, isChecked: boolean) => {
        const updatedDays = isChecked
            ? [...days, day]
            : days.filter(d => d !== day);

        setDays(updatedDays);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.days = updatedDays;
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

    const handleDeleteClass = () => {
        if (!currentCombinedClass || !currentCombinedClass._id) return;

        // Confirmation dialog
        const isConfirmed = confirm(
            `Are you sure you want to delete ${currentCombinedClass.data.course_subject} ${currentCombinedClass.data.course_num}?\n\nThis action cannot be undone.`
        );

        if (isConfirmed) {
            try {
                deleteClasses([currentCombinedClass._id]);
                // Clear current class selection
                setCurrentClass(newDefaultEmptyClass());
            } catch (error) {
                alert("Failed to delete class. Please try again. ");
                console.log("Error deleting class:", error);
            }
        }
    };

    return (
        <div className="h-full w-full overflow-y-auto scrollbar-thin">
            {currentCombinedClass?._id ? (
                <ul className="flex flex-col w-full pb-4">
                    {/* Properties Section */}
                    <DropDown
                        renderButton={(isOpen) => (
                            <span className='font-bold text-gray-700 min-w-20 flex flex-row items-center justify-between'>
                                Properties
                                {isOpen ? <BiChevronUp /> : <BiChevronDown />}
                            </span>
                        )}
                        renderDropdown={() => (
                            <ul className='py-2'>
                                <li className="flex flex-col py-2 px-2 items-center focus-within:bg-blue-50">
                                    <span className='w-full text-start font-semibold'>Subject</span>
                                    <input
                                        type="text"
                                        placeholder="Subject"
                                        className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                                        value={courseSubject}
                                        onChange={handleCourseSubjectChange}
                                    />
                                </li>
                                <li className="flex flex-col py-2 px-2 items-center focus-within:bg-blue-50">
                                    <span className='w-full text-start font-semibold'>Course Number</span>
                                    <input
                                        type="text"
                                        className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                                        value={courseNum}
                                        onChange={handleCourseNumChange}
                                    />
                                </li>
                                <li className="flex flex-col py-2 px-2 items-center focus-within:bg-blue-50">
                                    <span className='w-full text-start font-semibold'>Title</span>
                                    <input
                                        type="text"
                                        className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                                        value={title}
                                        onChange={handleTitleChange}
                                    />
                                </li>
                                <li className="flex flex-col py-2 px-2 items-center focus-within:bg-blue-50">
                                    <span className='w-full text-start font-semibold'>Instructor</span>
                                    <input
                                        type="text"
                                        className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                                        value={instructor}
                                        onChange={handleInstructorChange}
                                    />
                                </li>
                                <li className="flex flex-col py-2 px-2 items-center focus-within:bg-blue-50">
                                    <span className='w-full text-start font-semibold'>Location</span>
                                    <input
                                        type="text"
                                        className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                                        value={room}
                                        onChange={handleRoomChange}
                                    />
                                </li>
                                <li className="flex flex-col py-2 px-2 items-center focus-within:bg-blue-50">
                                    <span className='w-full text-start font-semibold'>Location</span>
                                    <input
                                        type="text"
                                        className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                                        value={location}
                                        onChange={handleLocationChange}
                                    />
                                </li>
                                <li className="flex flex-col py-2 px-2 items-center focus-within:bg-blue-50">
                                    <span className='w-full text-start font-semibold'>Start Time</span>
                                    <input
                                        type="time"
                                        className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                                        value={startTime}
                                        onChange={handleStartTimeChange}
                                    />
                                </li>
                                <li className="flex flex-col py-2 px-2 items-center focus-within:bg-blue-50">
                                    <span className='w-full text-start font-semibold'>End Time</span>
                                    <input
                                        type="time"
                                        className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                                        value={endTime}
                                        onChange={handleEndTimeChange}
                                    />
                                </li>
                            </ul>
                        )}
                        buttonClassName="w-full text-left py-2"
                        dropdownClassName="relative shadow-none w-full"
                        alwaysOpen={true}
                    />

                    {/* Days Section */}
                    <DropDown
                        renderButton={(isOpen) => (
                            <span className="font-bold text-gray-700 min-w-20 flex flex-row items-center justify-between">
                                Days
                                {isOpen ? <BiChevronUp /> : <BiChevronDown />}
                            </span>
                        )}
                        renderDropdown={() => (
                            <div className="flex-1 flex flex-col py-2 pl-1">
                                {ShortenedDays.map(day => (
                                    <label key={day} className="flex items-center gap-1">
                                        <input
                                            type="checkbox"
                                            checked={days.includes(day)}
                                            onChange={(e) => handleDaysChange(day, e.target.checked)}
                                            className="form-checkbox h-4 w-4 cursor-pointer transition-all appearance-none rounded-sm shadow-sm hover:shadow-md border border-slate-300 checked:bg-blue-600 checked:border-ylue-600"
                                        />
                                        <span>{day}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        buttonClassName="w-full text-left py-2"
                        dropdownClassName="relative shadow-none w-full"
                        alwaysOpen={true}
                    />

                    {/* Tags Section */}
                    <DropDown
                        renderButton={(isOpen) => (
                            <span className="font-bold text-gray-700 min-w-20 flex flex-row items-center justify-between">
                                Tags
                                {isOpen ? <BiChevronUp /> : <BiChevronDown />}
                            </span>
                        )}
                        renderDropdown={() => (
                            <div className="flex-1 flex-col gap-2 py-2 pl-1">
                                {Array.from(allTags).sort((a, b) => a.length - b.length).map((tag) => (
                                    <label key={tag} className="flex items-center gap-1">
                                        <input
                                            type="checkbox"
                                            checked={tags.includes(tag)}
                                            onChange={(e) => handleTagCheck(tag, e.target.checked)}
                                            className="form-checkbox h-4 w-4 cursor-pointer transition-all appearance-none rounded-sm shadow-sm hover:shadow-md border border-slate-300 checked:bg-blue-600 checked:border-ylue-600"
                                        />
                                        <span>{tag}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        buttonClassName="w-full text-left py-2"
                        dropdownClassName="relative shadow-none w-full"
                        alwaysOpen={true}
                    />

                    {/* Delete button - only show if we have a valid class with an ID */}
                    {currentCombinedClass && currentCombinedClass._id && (
                        <li className="flex hover:border-gray-200 border-transparent border-y items-center pt-4">
                            <button
                                onClick={handleDeleteClass}
                                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors cursor-pointer"
                                aria-label="Delete class"
                            >
                                Delete Class
                            </button>
                        </li>
                    )}
                </ul>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                    Select a class to edit
                </div>
            )}
        </div>
    );
};

export default ClassProperties;