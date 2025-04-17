import React, { useEffect, useState } from 'react';
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { Class, ClassProperty, CombinedClass } from '@/lib/types';
import { newDefaultEmptyClass } from '@/lib/common';

// Cohort options constant
const COHORT_OPTIONS = ["Freshman", "Sophomore", "Junior", "Senior"];

const ClassProperties = () => {
    // const {tagList, deleteClass, setCurrentClass} = useCalendarContext();
    const { currentCombinedClass, updateOneClass } = useCalendarContext();
    const initialData: Class = currentCombinedClass?.data || {} as Class;
    const initialProps: ClassProperty = currentCombinedClass?.properties || {} as ClassProperty;

    const [courseSubject, setCourseSubject] = useState(initialData.course_subject || '');
    const [courseNum, setCourseNum] = useState(initialData.course_num || '');
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
            setTitle(newData.title || '');
            setInstructor(newProps.instructor_name || '');
            setEmail(newProps.instructor_email || '');
            setRoom(newProps.room || '');
            setCohort(newProps.cohort || '');
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

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setEmail(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.instructor_email = newVal;
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

    const handleCohortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newVal = e.target.value;
        setCohort(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.cohort = newVal;
            updateOneClass(modifiedClass);
        }
    };

    return (
        <div className="h-full w-full overflow-y-auto scrollbar-thin">
            {currentCombinedClass?._id ? (
                <ul className="flex flex-col w-full py-2">
                    {/* Properties Section */}
                    <div className='font-bold text-gray-700 min-w-20 flex flex-row items-center justify-between'>
                        Course Info
                    </div>
                    <li className="flex flex-col p-2 items-center focus-within:bg-blue-50">
                        <span className='w-full text-start font-semibold'>Subject</span>
                        <input
                            type="text"
                            placeholder="Subject"
                            className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                            value={courseSubject}
                            onChange={handleCourseSubjectChange}
                        />
                    </li>
                    <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50">
                        <span className='w-full text-start font-semibold'>Course Number</span>
                        <input
                            type="text"
                            className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                            value={courseNum}
                            onChange={handleCourseNumChange}
                        />
                    </li>
                    <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50">
                        <span className='w-full text-start font-semibold'>Title</span>
                        <input
                            type="text"
                            className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                            value={title}
                            onChange={handleTitleChange}
                        />
                    </li>
                    <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50">
                        <span className='w-full text-start font-semibold'>Instructor</span>
                        <input
                            type="text"
                            className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                            value={instructor}
                            onChange={handleInstructorChange}
                        />
                    </li>
                    <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50">
                        <span className='w-full text-start font-semibold'>Email</span>
                        <input
                            type="email"
                            className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                            value={email}
                            onChange={handleEmailChange}
                        />
                    </li>
                    <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50">
                        <span className='w-full text-start font-semibold'>Room</span>
                        <input
                            type="text"
                            className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                            value={room}
                            onChange={handleRoomChange}
                        />
                    </li>
                    <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50">
                        <span className='w-full text-start font-semibold'>Cohort</span>
                        <select
                            className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                            value={cohort}
                            onChange={handleCohortChange}
                        >
                            <option value="" className=''>Select Cohort</option>
                            {COHORT_OPTIONS.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </li>
                </ul>
            ) : (
                <div className="flex items-center justify-center text-center h-full text-gray-400 pb-8">
                    <p>Select a class to edit</p>
                </div>
            )}
        </div>
    );
};

export default ClassProperties;