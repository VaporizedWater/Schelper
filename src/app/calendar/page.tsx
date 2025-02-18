'use client'

import React, { useState } from 'react';
import Calendar from '@/components/Calendar/Calendar';
import CalendarSheet from '@/components/CalendarSheet/CalendarSheet';
import LeftMenu from '@/components/LeftMenu/LeftMenu';
import CalendarNav from '@/components/CalendarNav/CalendarNav';


const CalendarPage = () => {
    const [isCalendarOpen, setCalendarOpen] = useState(true);

    return (
        <div className='h-full grid grid-cols-[15%_80%]'>
            <LeftMenu></LeftMenu>
            <div className='grid grid-rows-[8%_85%]'>
                <div className='w-full h-full content-center'>
                    <CalendarNav toggleCalendar={(status: boolean) => setCalendarOpen(status)}></CalendarNav>
                </div>
                <div className='w-full h-full overflow-x-hidden'>
                    {isCalendarOpen ?
                        <Calendar></Calendar> :
                        <CalendarSheet></CalendarSheet>
                    }
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;