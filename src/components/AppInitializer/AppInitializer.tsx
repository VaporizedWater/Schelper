'use client'

import { useEffect } from 'react';
import { useCalendarContext } from '../CalendarContext/CalendarContext';

export default function AppInitializer() {
    const { allClasses } = useCalendarContext();

    // Force context initialization by accessing a value
    // This will trigger the useEffect in CalendarProvider
    useEffect(() => {
        console.log('App initializer mounted, calendar data loading triggered');
        console.log(`Current class count: ${allClasses.length}`);
    }, [allClasses.length]);

    // This component doesn't render anything
    return null;
}