"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { CalendarContextType, CombinedClass, ProviderProps, tagListType } from '@/lib/types';
import { EventInput } from '@fullcalendar/core/index.js';
import { insertTag, loadAllCombinedClasses, loadAllTags } from '@/lib/utils';

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const days: { [key: string]: string } = {
    Mon: '2025-01-06',
    Tues: '2025-01-07',
    Wed: '2025-01-08',
    Thurs: '2025-01-09',
    Fri: '2025-01-10',
};

export const CalendarProvider = ({ children }: ProviderProps) => {
    const [combinedClasses, setClasses] = useState<CombinedClass[]>([]); // All the classes in the context
    const [allEvents, setAllEvents] = useState<EventInput[]>([]); // All the events in the context
    const [currCombinedClass, setCurrClass] = useState<CombinedClass>(); // The currently selected class(es).
    const [displayClasses, setDisplayClasses] = useState<CombinedClass[]>([]); // The classes to display on the calendar based on tags
    const [displayEvents, setDisplayEvents] = useState<EventInput[]>([]); // The events to display on the calendar based on tags
    const [tagList, setTagList] = useState<tagListType>(new Map<string, { classIds: Set<string> }>()); // Map of tags to a set of class ids
    const [allTags, setAllTags] = useState<Set<string>>(new Set()); // All the tags in the context

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
                    if (newTagMap.has(tag)) {
                        newTagMap.get(tag)?.classIds.add(classItem.classData._id);
                    } else {
                        newTagMap.set(tag, { tagName: tag, classIds: new Set([classItem.classData._id]) });
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

            // Update state for tagList with a new Map so that consumers get a new reference
            setTagList(newTagMap);

            // Set all tags to all the tags in the database using loadAllTags
            const tags = await loadAllTags();
            setAllTags(tags);

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
        console.log("Display events updated" + JSON.stringify(newDisplayEvents));
    }

    const updateAllEvents = (newEvents: EventInput[]) => {
        setAllEvents(newEvents);
    }

    const dayMapping: { [full: string]: string } = {
        "Monday": "Mon",
        "Tuesday": "Tues",
        "Wednesday": "Wed",
        "Thursday": "Thurs",
        "Friday": "Fri"
    };

    const updateCurrentClass = (newClass: CombinedClass) => {
        console.log("Updating current class " + newClass.classData._id);
        // Update the class lists
        setCurrClass(newClass);
        setClasses(prev => prev.map(c => c.classData._id === newClass.classData._id ? newClass : c));
        setDisplayClasses(prev => prev.map(c => c.classData._id === newClass.classData._id ? newClass : c));

        // Recompute event
        const fullDay = newClass.classProperties.days[0];
        const shortDay = dayMapping[fullDay] || fullDay;
        const convertedDay = days[shortDay] || '2025-01-06';
        const dateStringStart = convertedDay + 'T' + newClass.classProperties.start_time;
        const dateStringEnd = convertedDay + 'T' + newClass.classProperties.end_time;

        const newEvent = {
            title: newClass.classData.title,
            start: dateStringStart,
            end: dateStringEnd,
            extendedProps: {
                combinedClassId: newClass.classData._id,
            }
        };

        // Update events arrays
        setAllEvents(prev => prev.map(ev =>
            ev.extendedProps?.combinedClassId === newClass.classData._id ? newEvent : ev
        ));
        setDisplayEvents(prev => prev.map(ev =>
            ev.extendedProps?.combinedClassId === newClass.classData._id ? newEvent : ev
        ));
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
            updateAllEvents,
            displayEvents,
            updateDisplayEvents,
            tagList,
            allTags,
            updateCurrentClass,
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