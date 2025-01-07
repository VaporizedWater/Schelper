'use client'

import React, { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar/Calendar';
import { CombinedClass, standardTimeSlot } from '../../lib/types';
import { loadClassOfUser } from '../../lib/utils';
import { PositionProvider } from '@/components/PositionContext/PositionContext';
import Calendar2 from '@/components/Calendar2/Calendar2';

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
            <PositionProvider>
                <Calendar2 classes={combinedClasses} standardTimeSlots={timeSlots} />
            </PositionProvider>
        </div>
    );
}

export default CalendarPage;