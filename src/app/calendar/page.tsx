'use client'

import React, { useState } from 'react';
import Calendar2 from '@/components/Calendar2/Calendar2';
import CalendarSheet2 from '@/components/CalendarSheet2/CalendarSheet2';
import LeftMenu from '@/components/LeftMenu/LeftMenu';
import CalendarNav2 from '@/components/CalendarNav2/CalendarNav2';
import Calendar from '@/components/Calendar/Calendar';
import CalendarSheet from '@/components/CalendarSheet/CalendarSheet';
import CalendarNav from '@/components/CalendarNav/CalendarNav';


const CalendarPage = () => {
    const [isCalendarOpen, setCalendarOpen] = useState(true);

    return (
        <div className='h-full grid grid-cols-[10%_85%]'>
            <LeftMenu></LeftMenu>
            <div className='grid grid-rows-[10%_85%]'>
                <div className='w-full h-full'>
                    <CalendarNav toggleCalendar={(status: boolean) => setCalendarOpen(status)}></CalendarNav>
                </div>
                <div className='w-full h-full'>
                    {isCalendarOpen ?
                        <Calendar2></Calendar2> :
                        <CalendarSheet2></CalendarSheet2>
                    }
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;