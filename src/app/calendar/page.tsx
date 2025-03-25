'use client'

import React, { useEffect, useState } from 'react';
import Calendar from '@/components/Calendar/Calendar';
import CalendarSheet from '@/components/CalendarSheet/CalendarSheet';
import LeftMenu from '@/components/LeftMenu/LeftMenu';
import CalendarNav from '@/components/CalendarNav/CalendarNav';
import { useSearchParams } from 'next/navigation';
import { useCalendarContext } from '@/components/CalendarContext/CalendarContext';

const CalendarPage = () => {
    const [isCalendarOpen, setCalendarOpen] = useState(true);
    const searchParams = useSearchParams();
    const { allClasses, updateDisplayClasses } = useCalendarContext();

    // Apply cohort filter from URL parameter
    useEffect(() => {
        const cohort = searchParams.get('cohort');

        if (cohort && ['freshman', 'sophomore', 'junior', 'senior'].includes(cohort)) {
            // Filter classes to only show those with the matching cohort tag
            const filteredClasses = allClasses.filter(cls =>
                cls.properties.tags && cls.properties.tags.includes(cohort)
            );

            // Update display classes to show only the filtered classes
            updateDisplayClasses(filteredClasses);
        } else {
            // If no cohort filter or invalid cohort, show all classes
            updateDisplayClasses(allClasses);
        }
    }, []);

    return (
        <div className='h-full grid grid-cols-[15%_85%]'>
            <div className='min-w-24 h-full overflow-hidden'>
                <LeftMenu />
            </div>
            <div className='grid grid-rows-[auto_1fr] h-full'>
                <div className='w-full content-center'>
                    <CalendarNav toggleCalendar={(status: boolean) => setCalendarOpen(status)} />
                </div>
                <div className='w-full h-full overflow-hidden px-2'>
                    {isCalendarOpen ?
                        <Calendar /> :
                        <CalendarSheet />
                    }
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;