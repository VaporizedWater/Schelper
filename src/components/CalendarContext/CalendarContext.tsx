"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { CalendarContextType, CombinedClass, ProviderProps, tagListType } from '@/lib/types';
import { EventInput } from '@fullcalendar/core/index.js';
import { loadAllCombinedClasses, loadAllTags, updateCombinedClass } from '@/lib/utils';

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const days: { [key: string]: string } = {
    Mon: '2025-01-06',
    Tue: '2025-01-07',
    Wed: '2025-01-08',
    Thu: '2025-01-09',
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadClasses = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const allClasses = await loadAllCombinedClasses();
                if (!mounted) return;

                const newTagMap = new Map<string, { classIds: Set<string> }>();
                const newEvents: EventInput[] = [];

                allClasses.forEach(classItem => {
                    if (!classItem.classProperties.days?.[0]) return;

                    const convertedDay = days[classItem.classProperties.days[0]];
                    const dateStringStart = `${convertedDay}T${classItem.classProperties.start_time}`;
                    const dateStringEnd = `${convertedDay}T${classItem.classProperties.end_time}`;

                    classItem.event = {
                        title: classItem.classData.title,
                        start: dateStringStart,
                        end: dateStringEnd,
                        extendedProps: {
                            combinedClassId: classItem.classData._id,
                        },
                    };
                    newEvents.push(classItem.event);

                    // Process tags
                    classItem.classProperties.tags?.forEach(tag => {
                        if (!newTagMap.has(tag)) {
                            newTagMap.set(tag, { classIds: new Set() });
                        }
                        newTagMap.get(tag)?.classIds.add(classItem.classData._id);
                    });
                });

                if (mounted) {
                    setAllEvents(newEvents);
                    setDisplayEvents(newEvents);
                    setClasses(allClasses);
                    setDisplayClasses(allClasses);
                    setTagList(newTagMap);

                    const tags = await loadAllTags();
                    setAllTags(tags);
                }
            } catch (err) {
                if (mounted) {
                    console.error('Error loading classes:', err);
                    setError(err instanceof Error ? err.message : 'Failed to load classes');
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        loadClasses();
        return () => { mounted = false; };
    }, []);

    const updateAllClasses = (newClasses: CombinedClass[]) => {
        console.log(newClasses);
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
        "Tuesday": "Tue",
        "Wednesday": "Wed",
        "Thursday": "Thu",
        "Friday": "Fri"
    };

    const updateCurrentClass = (newClass: CombinedClass) => {
        console.log("Updating current class " + newClass.classData._id);
        // Update the class lists
        setCurrClass(newClass);
        setClasses(prev => prev.map(c => c.classData._id === newClass.classData._id ? newClass : c));
        setDisplayClasses(prev => prev.map(c => c.classData._id === newClass.classData._id ? newClass : c));

        // Update the database (THIS IS TEMPORARY FOR THE DEMO AND PRESENTATION, MAKE SURE TO DO THE DIFFERENCES TRACKING IN THE FUTURE)
        updateCombinedClass(newClass);

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
            isLoading,
            error,
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

// A method for iterating over the contents of a custom type without manually specifying the property names
// if (currCombinedClass) {
//     Object.keys(currCombinedClass.classData).forEach(key => {
//         console.log(key, currCombinedClass.classData[key as keyof typeof currCombinedClass.classData]);
//     });
// }