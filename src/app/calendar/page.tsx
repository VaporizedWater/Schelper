'use client'

import React, { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar/Calendar';
import { CombinedClass } from '../api/types';
import { loadClassOfUser } from '../api/utils';

const CalendarPage = () => {
    const [combinedClasses, setClassData] = useState([] as CombinedClass[]);
    const [classLoading, setClassLoading] = useState(true);

    useEffect(() => {
        if (classLoading) {
            loadClassOfUser("abc").then((classData) => {
                setClassData(classData);
                setClassLoading(false);
            }).catch(error => {
                console.error("Error loading class data:", error);
                setClassLoading(false);
            });
        }
    }, [classLoading]);

    if (!classLoading) {
        return (<div className='flex flex-col'>
            <Calendar classes={combinedClasses} />
        </div>);
    } else {
        return (<div className='flex flex-col'>
            <Calendar classes={[] as CombinedClass[]} />
        </div>);
    }
}

export default CalendarPage;