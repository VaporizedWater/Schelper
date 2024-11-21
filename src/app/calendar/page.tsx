'use client'

import React from 'react';
import Calendar from '@/components/Calendar/Calendar';
import ClassDisplay from '@/components/ClassDisplay/ClassDisplay';

const CalendarPage = () => (
    <div className='flex flex-col'>
        <Calendar />
        <ClassDisplay classId="67342bdf6eedd711f643d1a6" />
    </div>
);

export default CalendarPage;