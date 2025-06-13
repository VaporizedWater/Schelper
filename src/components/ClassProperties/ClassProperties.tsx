import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { ClassData, ClassProperty, CombinedClass, tagType } from '@/lib/types';
import { newDefaultEmptyClass } from '@/lib/common';

// Cohort options constant
const COHORT_OPTIONS = ["Freshman", "Sophomore", "Junior", "Senior"];

const ClassProperties = () => {
    // const {tagList, deleteClass, setCurrentClass} = useCalendarContext();
    const { currentCombinedClass, updateOneClass, toggleConflictPropertyChanged } = useCalendarContext();
    const initialData: ClassData = currentCombinedClass?.data || {} as ClassData;
    const initialProps: ClassProperty = currentCombinedClass?.properties || {} as ClassProperty;

    const [courseSubject, setCourseSubject] = useState(initialData.course_subject || '');
    const [courseNum, setCourseNum] = useState(initialData.course_num || '');
    const [section, setSection] = useState(initialData.section || '');
    const [title, setTitle] = useState(initialData.title || '');
    const [instructor, setInstructor] = useState(initialProps.instructor_name || '');
    const [email, setEmail] = useState(initialProps.instructor_email || '');
    const [room, setRoom] = useState(initialProps.room || '');
    const [cohort, setCohort] = useState(initialProps.cohort || '');

    useEffect(() => {
        if (currentCombinedClass) {
            const newData = currentCombinedClass.data;
            const newProps = currentCombinedClass.properties;
            setCourseSubject(newData.course_subject || '');
            setCourseNum(newData.course_num || '');
            setSection(newData.section || '');
            setTitle(newData.title || '');
            setInstructor(newProps.instructor_name || '');
            setEmail(newProps.instructor_email || '');
            setRoom(newProps.room || '');
            setCohort(newProps.cohort || '');
        }
    }, [currentCombinedClass, toggleConflictPropertyChanged, updateOneClass]);

    const handleCourseSubjectChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setCourseSubject(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.data.course_subject = newVal;
            updateOneClass(modifiedClass);
            toggleConflictPropertyChanged();
        }
    }, [currentCombinedClass, toggleConflictPropertyChanged, updateOneClass]);

    const handleCourseNumChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setCourseNum(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.data.course_num = newVal;
            updateOneClass(modifiedClass);
            toggleConflictPropertyChanged();
        }
    }, [currentCombinedClass, toggleConflictPropertyChanged, updateOneClass]);

    const handleSectionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setSection(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.data.section = newVal;
            updateOneClass(modifiedClass);
            toggleConflictPropertyChanged();
        }
    }, [currentCombinedClass, toggleConflictPropertyChanged, updateOneClass]);

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setTitle(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.data.title = newVal;
            updateOneClass(modifiedClass);
            toggleConflictPropertyChanged();
        }
    }, [currentCombinedClass, toggleConflictPropertyChanged, updateOneClass]);

    const handleInstructorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setInstructor(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.instructor_name = newVal;
            updateOneClass(modifiedClass);
            toggleConflictPropertyChanged();
        }
    }, [currentCombinedClass, toggleConflictPropertyChanged, updateOneClass]);

    const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setEmail(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.instructor_email = newVal;
            updateOneClass(modifiedClass);
            toggleConflictPropertyChanged();
        }
    }, [currentCombinedClass, toggleConflictPropertyChanged, updateOneClass]);

    const handleRoomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setRoom(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.room = newVal;
            updateOneClass(modifiedClass);
            toggleConflictPropertyChanged();
        }
    }, [currentCombinedClass, toggleConflictPropertyChanged, updateOneClass]);

    const handleCohortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newVal = e.target.value;
        setCohort(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.cohort = newVal;

            modifiedClass.properties.tags.filter(tag => tag.tagCategory !== "cohort");
            modifiedClass.properties.tags.push({ tagName: newVal.toLowerCase(), tagCategory: "cohort" } as tagType);

            updateOneClass(modifiedClass);
            toggleConflictPropertyChanged();
        }
    }, [currentCombinedClass, toggleConflictPropertyChanged, updateOneClass]);

    const cohortOptionsMap = useMemo(() => {
        return COHORT_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
        ))
    }, []);

    return (
        <div className="h-full w-full overflow-y-auto scrollbar-thin flex flex-col">
            <div className='w-full text-left py-2 font-bold text-gray-700 dark:text-gray-300'>
                Course Info
            </div>
            <div className="h-full">
                {currentCombinedClass?._id ? (
                    <ul className="flex flex-col w-full">
                        {/* Properties Section */}

                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <span className='w-full text-start font-semibold'>Subject</span>
                            <input
                                type="text"
                                placeholder="Subject"
                                className="flex-1 hover:border-gray-200 dark:hover:border-gray-600 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={courseSubject}
                                onChange={handleCourseSubjectChange}
                            />
                        </li>
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <span className='w-full text-start font-semibold'>Course Number</span>
                            <input
                                type="text"
                                className="flex-1 hover:border-gray-200 dark:hover:border-gray-600 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={courseNum}
                                onChange={handleCourseNumChange}
                            />
                        </li>
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <span className='w-full text-start font-semibold'>Section</span>
                            <input
                                type="text"
                                className="flex-1 hover:border-gray-200 dark:hover:border-gray-600 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={section}
                                onChange={handleSectionChange}
                            />
                        </li>
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <span className='w-full text-start font-semibold'>Title</span>
                            <input
                                type="text"
                                className="flex-1 hover:border-gray-200 dark:hover:border-gray-600 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={title}
                                onChange={handleTitleChange}
                            />
                        </li>
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <span className='w-full text-start font-semibold'>Instructor</span>
                            <input
                                type="text"
                                className="flex-1 hover:border-gray-200 dark:hover:border-gray-600 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={instructor}
                                onChange={handleInstructorChange}
                            />
                        </li>
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <span className='w-full text-start font-semibold'>Email</span>
                            <input
                                type="email"
                                className="flex-1 hover:border-gray-200 dark:hover:border-gray-600 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={email}
                                onChange={handleEmailChange}
                            />
                        </li>
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <span className='w-full text-start font-semibold'>Room</span>
                            <input
                                type="text"
                                className="flex-1 hover:border-gray-200 dark:hover:border-gray-600 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={room}
                                onChange={handleRoomChange}
                            />
                        </li>
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <span className='w-full text-start font-semibold'>Cohort</span>
                            <select
                                className="flex-1 hover:border-gray-200 dark:hover:border-gray-600 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={cohort}
                                onChange={handleCohortChange}
                            >
                                <option value="" className=''>Select Cohort</option>
                                {cohortOptionsMap}
                            </select>
                        </li>
                        <li className="flex flex-col py-1 px-2 items-center rounded">
                            <span className='w-full text-start font-semibold'>Owners</span>
                            <ul className="flex-1 pl-1 w-full text-gray-700 dark:text-gray-400 list-inside">
                                <li>{initialProps.owners || "Not specified"}</li>
                            </ul>
                        </li>
                    </ul>
                ) : (
                    <div className="flex items-center justify-center text-center h-full text-gray-400 pb-8">
                        <p>Select a class to edit</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassProperties;