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
        <div
            id="course-info-panel"
            className="h-full w-full overflow-y-auto scrollbar-thin flex flex-col"
            role="region"
            aria-labelledby="course-info-title"
        >
            <div
                id="course-info-title"
                className="w-full text-left py-2 font-bold text-gray-700 dark:text-gray-300"
            >
                Course Info
            </div>

            <div className="h-full">
                {currentCombinedClass?._id ? (
                    <ul className="flex flex-col w-full" role="group" aria-label="Course properties">
                        {/* Subject */}
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <label
                                htmlFor="course-subject"
                                className="w-full text-start font-semibold"
                            >
                                Subject
                            </label>
                            <input
                                id="course-subject"
                                name="courseSubject"
                                type="text"
                                placeholder="Subject"
                                className="flex-1 hover:border-gray-200 dark:hover:border-gray-600 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={courseSubject}
                                onChange={handleCourseSubjectChange}
                                aria-required="true"
                            />
                        </li>

                        {/* Course Number */}
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <label
                                htmlFor="course-number"
                                className="w-full text-start font-semibold"
                            >
                                Course Number
                            </label>
                            <input
                                id="course-number"
                                name="courseNum"
                                type="text"
                                className="flex-1 hover:border-gray-200 dark:hover:border-gray-600 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={courseNum}
                                onChange={handleCourseNumChange}
                                aria-required="true"
                            />
                        </li>

                        {/* Section */}
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <label
                                htmlFor="course-section"
                                className="w-full text-start font-semibold"
                            >
                                Section
                            </label>
                            <input
                                id="course-section"
                                name="section"
                                type="text"
                                className="flex-1 hover:border-gray-200 dark:hover:border-gray-600 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={section}
                                onChange={handleSectionChange}
                            />
                        </li>

                        {/* Title */}
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <label
                                htmlFor="course-title"
                                className="w-full text-start font-semibold"
                            >
                                Title
                            </label>
                            <input
                                id="course-title"
                                name="title"
                                type="text"
                                className="flex-1 hover:border-gray-200 dark:hover:border-gray-600 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={title}
                                onChange={handleTitleChange}
                            />
                        </li>

                        {/* Instructor */}
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <label
                                htmlFor="course-instructor"
                                className="w-full text-start font-semibold"
                            >
                                Instructor
                            </label>
                            <input
                                id="course-instructor"
                                name="instructor"
                                type="text"
                                className="flex-1 hover:border-gray-200 dark:hover:border-gray-600 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={instructor}
                                onChange={handleInstructorChange}
                            />
                        </li>

                        {/* Email */}
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <label
                                htmlFor="course-email"
                                className="w-full text-start font-semibold"
                            >
                                Email
                            </label>
                            <input
                                id="course-email"
                                name="email"
                                type="email"
                                className="flex-1 hover:border-gray-200 dark:hover:border-gray-600 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={email}
                                onChange={handleEmailChange}
                            />
                        </li>

                        {/* Room */}
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <label
                                htmlFor="course-room"
                                className="w-full text-start font-semibold"
                            >
                                Room
                            </label>
                            <input
                                id="course-room"
                                name="room"
                                type="text"
                                className="flex-1 hover:border-gray-200 dark:hover:border-gray-600 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={room}
                                onChange={handleRoomChange}
                            />
                        </li>

                        {/* Cohort */}
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <label
                                htmlFor="course-cohort"
                                className="w-full text-start font-semibold"
                            >
                                Cohort
                            </label>
                            <select
                                id="course-cohort"
                                name="cohort"
                                className="flex-1 hover:border-gray-200 dark:hover:border-gray-600 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={cohort}
                                onChange={handleCohortChange}
                            >
                                <option value="">Select Cohort</option>
                                {cohortOptionsMap}
                            </select>
                        </li>

                        {/* Owners (read-only) */}
                        <li className="flex flex-col py-1 px-2 items-center rounded">
                            <span className="w-full text-start font-semibold">Owners</span>
                            <ul
                                className="flex-1 pl-1 w-full text-gray-700 dark:text-gray-400 list-inside"
                                aria-label="Course owners"
                            >
                                <li>{initialProps.owners || "Not specified"}</li>
                            </ul>
                        </li>
                    </ul>
                ) : (
                    <div
                        className="flex items-center justify-center text-center h-full text-gray-400 pb-8"
                        role="alert"
                    >
                        <p>Select a class to edit</p>
                    </div>
                )}
            </div>
        </div>
    );

};

export default ClassProperties;