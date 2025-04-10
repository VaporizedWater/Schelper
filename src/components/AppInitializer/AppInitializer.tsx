'use client'

import { useEffect } from 'react';
import { useCalendarContext } from '../CalendarContext/CalendarContext';
import { useSession } from 'next-auth/react';

export default function AppInitializer() {
    const { allClasses } = useCalendarContext();
    const { data: session } = useSession();

    // Force context initialization by accessing a value
    // This will trigger the useEffect in CalendarProvider
    useEffect(() => {
        if (session?.user) {
            console.log('App initializer mounted, calendar data loading triggered');
            console.log(`Current class count: ${allClasses.length}`);
        }
    }, [allClasses.length]);

    // This component doesn't render anything
    return null;
}