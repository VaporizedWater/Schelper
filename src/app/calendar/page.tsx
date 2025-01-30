'use client'

import React, { useState, useEffect } from 'react';
import { CombinedClass, standardTimeSlot } from '../../lib/types';
import { loadClassOfUser } from '../../lib/utils';
import Calendar from '@/components/Calendar/Calendar';


const CalendarPage = () => {
    const [combinedClasses, setClassData] = useState([] as CombinedClass[]);
    const [timeSlots, setTimeSlots] = useState([] as standardTimeSlot[]);
    const [classLoading, setClassLoading] = useState(true);

    useEffect(() => {
        if (classLoading) {
            loadClassOfUser("abc").then((classData) => {
                setClassData(classData);
                setClassLoading(false);
            }).catch(error => {
                console.error("Error loading class data:", error);
                setClassLoading(false);
            });
        }
    }, [classLoading]);

    return (
        <div className='flex flex-col'>
            <Calendar classes={combinedClasses} standardTimeSlots={timeSlots} />
        </div>
    );
}

export default CalendarPage;