'use client'

import React, { useState } from 'react';
import Calendar2 from '@/components/Calendar2/Calendar2';
import CalendarSheet2 from '@/components/CalendarSheet2/CalendarSheet2';
import LeftMenu from '@/components/LeftMenu/LeftMenu';
import CalendarNav2 from '@/components/CalendarNav2/CalendarNav2';
import Calendar from '@/components/Calendar/Calendar';
import CalendarSheet from '@/components/CalendarSheet/CalendarSheet';

const CalendarPage = () => {
    const [isCalendarOpen, setCalendarOpen] = useState(true);

    return (
        <div className="grid grid-cols-[auto,1fr] min-h-[calc(100vh-4rem)]">
            <LeftMenu />
            <div className="flex flex-col">
                <div className="">
                    <CalendarNav2 toggleCalendar={(status: boolean) => setCalendarOpen(status)} />
                </div>
                <div className="">
                    {isCalendarOpen ? <Calendar2 /> : <CalendarSheet2 />}
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;