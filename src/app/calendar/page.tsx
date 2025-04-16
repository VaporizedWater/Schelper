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
    const { allClasses, updateAllClasses } = useCalendarContext();

    // Apply cohort filter from URL parameter
    useEffect(() => {
        const cohort = searchParams.get('cohort');

        if (cohort && ['freshman', 'sophomore', 'junior', 'senior'].includes(cohort)) {
            // Filter classes to only show those with the matching cohort tag
            const updatedClasses = allClasses.map(cls => {
                const isVisible = cls.properties.tags?.some(tag => tag.tagName === cohort);
                return {
                    ...cls,
                    visible: isVisible
                };
            });

            updateAllClasses(updatedClasses);
        } else {
            // If no cohort filter or invalid cohort, show all classes
            const updatedClasses = allClasses.map(cls => {
                return {
                    ...cls,
                    visible: true
                };
            });

            updateAllClasses(updatedClasses);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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