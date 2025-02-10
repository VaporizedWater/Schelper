"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { CombinedClass } from '@/lib/types';
import { EventInput } from '@fullcalendar/core/index.js';
import { loadAllCombinedClasses } from '@/lib/utils';
import { s } from 'node_modules/@fullcalendar/core/internal-common';

interface CalendarContextType {
    currCombinedClass: CombinedClass | undefined;
    updateCurrClass: (newCombinedClass: CombinedClass) => void;
    allClasses: CombinedClass[];
    allEvents: EventInput[];
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
    children: ReactNode;
}

const days: { [key: string]: string } = {
    Mon: '2025-01-06',
    Tues: '2025-01-07',
    Wed: '2025-01-08',
    Thurs: '2025-01-09',
    Fri: '2025-01-10',
};

export const CalendarProvider = ({ children }: CalendarProviderProps) => {
    const [combinedClasses, setClasses] = useState<CombinedClass[]>([]); // All the classes in the context
    const [allEvents, setAllEvents] = useState<EventInput[]>([]); // All the events in the context
    const [currCombinedClass, setCurrClass] = useState<CombinedClass>(); // The currently selected class(es).

    // Load in all classes
    useEffect(() => {
        const loadClasses = async () => {
            const allClasses = await loadAllCombinedClasses(); // load from db

            // Fill up all classes with events
            for (const classItem of allClasses) {
                const convertedDay = days[classItem.classProperties.days[0]];
                const dateStringStart = convertedDay + 'T' + classItem.classProperties.start_time;
                const dateStringEnd = convertedDay + 'T' + classItem.classProperties.end_time;

                classItem.event = {
                    title: classItem.classData.title,
                    start: dateStringStart,
                    end: dateStringEnd,
                    extendedProps: {
                        combinedClassId: classItem.classData._id,
                    }
                };
            }

            // Set events to the events in all classes
            setAllEvents(allClasses.map((item) => item.event as EventInput));

            // Set all classes
            setClasses(allClasses);

            // console.log(JSON.stringify(allClasses) + " THIS IS ALL CLASSES\n");
            // console.log(JSON.stringify(currCombinedClass) + " THIS IS CURR CLASS\n");
        }
        loadClasses();
    }, []);

    const updateCurrClass = (newClass: CombinedClass) => { // Update the currently selected class
        setCurrClass(newClass);
    }

    return (
        <CalendarContext.Provider value={{ currCombinedClass, updateCurrClass, allClasses: combinedClasses, allEvents }} >
            {children}
        </CalendarContext.Provider>
    );
}

export const useCalendarContext = () => {
    const context = useContext(CalendarContext);
    if (context === undefined) {
        throw new Error('useCalendarContext must be used within a CalendarProvider');
    }
    return context;
}

