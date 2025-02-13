"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { CombinedClass } from '@/lib/types';
import { EventInput } from '@fullcalendar/core/index.js';
import { loadAllCombinedClasses } from '@/lib/utils';

interface CalendarContextType {
    currCombinedClass: CombinedClass | undefined;
    updateCurrClass: (newCombinedClass: CombinedClass) => void;
    allClasses: CombinedClass[];
    updateAllClasses: (newClasses: CombinedClass[]) => void;
    displayClasses: CombinedClass[];
    updateDisplayClasses: (newDisplayClasses: CombinedClass[]) => void;
    allEvents: EventInput[];
    displayEvents: EventInput[];
    updateDisplayEvents: (newDisplayEvents: EventInput[]) => void;
    tagList: Map<string, { tagName: string; classIds: Set<string> }>; // Map of tags to a set of class ids
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
    const [displayClasses, setDisplayClasses] = useState<CombinedClass[]>([]); // The classes to display on the calendar based on tags
    const [displayEvents, setDisplayEvents] = useState<EventInput[]>([]); // The events to display on the calendar based on tags
    const [tagList, setTagList] = useState<Map<string, { tagName: string; classIds: Set<string> }>>(
        new Map()
    );

    // Load in all classes
    useEffect(() => {
        const loadClasses = async () => {
            const allClasses = await loadAllCombinedClasses(); // load from db

            // Create a new Map which will be set in state
            const newTagMap = new Map<string, { tagName: string; classIds: Set<string> }>();

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
                    },
                };

                // Add tags to newTagMap instead of directly modifying state tagList
                if (!classItem.classProperties.tags || classItem.classProperties.tags.length === 0) {
                    console.log("No tags for class: " + classItem.classData._id);
                    continue;
                }

                for (const tag of classItem.classProperties.tags) {
                    if (newTagMap.has(tag.id)) {
                        newTagMap.get(tag.id)?.classIds.add(classItem.classData._id);
                        console.log("Added class: " + classItem.classData._id + " to tag: " + tag.name);
                    } else {
                        newTagMap.set(tag.id, { tagName: tag.name, classIds: new Set([classItem.classData._id]) });
                        console.log("Added tag: " + tag.name + " with class: " + classItem.classData._id);
                    }
                }
            }

            // Set events to the events in all classes
            setAllEvents(allClasses.map((item) => item.event as EventInput));

            // Set all display events to all events
            setDisplayEvents(allClasses.map((item) => item.event as EventInput));

            // Set all classes
            setClasses(allClasses);

            // Set display classes to all classes
            setDisplayClasses(allClasses);
            console.log("HERE");

            // Update state for tagList with a new Map so that consumers get a new reference
            setTagList(newTagMap);

            // Display tagList in full with all objects and subobjects expanded
            const serializableTagList = Array.from(newTagMap.entries()).map(([id, { tagName, classIds }]) => ({
                id,
                tagName,
                classIds: Array.from(classIds),
            }));

            console.log("Full tagList:", JSON.stringify(serializableTagList, null, 2));
        }
        loadClasses();
    }, []);

    const updateAllClasses = (newClasses: CombinedClass[]) => {
        setClasses(newClasses);
    }

    const updateCurrClass = (newClass: CombinedClass) => {
        setCurrClass(newClass);
    }

    const updateDisplayClasses = (newDisplayClasses: CombinedClass[]) => {
        setDisplayClasses(newDisplayClasses);
    }

    const updateDisplayEvents = (newDisplayEvents: EventInput[]) => {
        setDisplayEvents(newDisplayEvents);
    }

    return (
        <CalendarContext.Provider value={{
            currCombinedClass,
            updateCurrClass,
            allClasses: combinedClasses,
            updateAllClasses,
            displayClasses,
            updateDisplayClasses,
            allEvents,
            displayEvents,
            updateDisplayEvents,
            tagList,
        }}>
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