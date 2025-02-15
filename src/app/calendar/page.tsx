'use client'

import React, { useState } from 'react';
import LeftMenu from '@/components/LeftMenu/LeftMenu';
import CalendarSheet from '@/components/CalendarSheet/CalendarSheet';
import CalendarNav from '@/components/CalendarNav/CalendarNav';
import Calendar from '@/components/Calendar/Calendar';

const CalendarPage = () => {
    const [isCalendarOpen, setCalendarOpen] = useState(true);

    return (
        <div className='h-full grid grid-cols-[15%_80%]'>
            <LeftMenu></LeftMenu>
            <div className='grid grid-rows-[10%_85%] mr-4'>
                <div className='h-full'>
                    <CalendarNav toggleCalendar={(status: boolean) => setCalendarOpen(status)}></CalendarNav>
                </div>
                <div className='h-full overflow-x-hidden'>
                    {isCalendarOpen ?
                        <Calendar /> :
                        <CalendarSheet />
                    }
                </div>
            </div>
        </div >
    );
};

export default CalendarPage;