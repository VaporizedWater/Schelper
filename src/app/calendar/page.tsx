'use client'

// import React, { useState, useEffect } from 'react';
// import { CombinedClass, standardTimeSlot } from '../../lib/types';
import Calendar from '@/components/Calendar/Calendar';
// import { loadAllCombinedClasses } from '@/lib/utils';


const CalendarPage = () => {
    // const [combinedClasses, setClassData] = useState([] as CombinedClass[]);
    // const [timeSlots, setTimeSlots] = useState([] as standardTimeSlot[]);
    // const [classLoading, setClassLoading] = useState(true);

    // useEffect(() => {
    //     if (classLoading) {
    //         loadAllCombinedClasses.then((classData: CombinedClass[]) => {
    //             setClassData(classData);
    //             setClassLoading(false);
    //         }).catch(error => {
    //             console.error("Error loading class data:", error);
    //             setClassLoading(false);
    //             setTimeSlots([]);
    //         });
    //     }
    // }, [classLoading]);

    return (
        <div className='flex flex-col '>
            <Calendar />
        </div>
    );
}

export default CalendarPage;