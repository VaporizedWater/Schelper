'use client'

import React, { useState } from 'react';
import Calendar from '@/components/Calendar/Calendar';
import CalendarSheet from '@/components/CalendarSheet/CalendarSheet';
import LeftMenu from '@/components/LeftMenu/LeftMenu';
import CalendarNav from '@/components/CalendarNav/CalendarNav';

const CalendarPage = () => {
    const [isCalendarOpen, setCalendarOpen] = useState(true);

    return (
        <div className='h-full grid grid-cols-[15%_85%]'>
            <div className='min-w-24'>
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