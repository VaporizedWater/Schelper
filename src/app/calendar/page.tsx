'use client'

import React from 'react';
import Calendar from '@/components/Calendar/Calendar';
import ClassDisplay from '@/components/ClassDisplay/ClassDisplay';

const CalendarPage = () => (
    <div className='flex flex-col'>
        <Calendar />
        <ClassDisplay classId="67414a410fd45343c92b76e8" />
    </div>
);

export default CalendarPage;