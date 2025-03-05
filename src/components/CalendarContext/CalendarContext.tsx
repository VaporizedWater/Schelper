"use client"

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CalendarContextType, CombinedClass, ConflictType, ProviderProps, tagListType } from '@/lib/types';
import { EventInput } from '@fullcalendar/core/index.js';
import { loadAllCombinedClasses, loadAllTags, updateCombinedClass } from '@/lib/utils';
import { createEventFromCombinedClass, dayToDate } from '@/lib/common';

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider = ({ children }: ProviderProps) => {
    const [combinedClasses, setClasses] = useState<CombinedClass[]>([]); // All the classes in the context
    const [currentCombinedClass, setCurrentClass] = useState<CombinedClass>(); // The currently selected class(es).
    const [isLoading, setIsLoading] = useState(true);
    const [conflicts, setConflicts] = useState<ConflictType[]>([]);
    const [reset, refreshComponent] = useState<string>("");

    const [allEvents, setAllEvents] = useState<EventInput[]>([]); // All the events in the context
    const [displayClasses, setDisplayClasses] = useState<CombinedClass[]>([]); // The classes to display on the calendar based on tags
    const [displayEvents, setDisplayEvents] = useState<EventInput[]>([]); // The events to display on the calendar based on tags
    const [tagList, setTagList] = useState<tagListType>(new Map<string, { classIds: Set<string> }>()); // Map of tags to a set of class ids
    const [allTags, setAllTags] = useState<Set<string>>(new Set()); // All the tags in the context

    useEffect(() => {
        let mounted = true;

        const loadClasses = async () => {
            try {
                setIsLoading(true);

                const allClasses = await loadAllCombinedClasses();

                if (!mounted) return;

                const newTagMap = new Map<string, { classIds: Set<string> }>();
                const newEvents: EventInput[] = [];

                allClasses.forEach(classItem => {
                    if (!classItem.classProperties.days?.[0]) return;

                    classItem.event = createEventFromCombinedClass(classItem);
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

    const detectConflicts = useCallback(() => {
        // Check for conflicts
        // Sort by start time
        const sortedClasses = combinedClasses.slice().sort((a, b) => {
            const aStart = a.classProperties.start_time;
            const bStart = b.classProperties.start_time;
            if (!aStart || !bStart) return 0;
            return aStart.localeCompare(bStart);
        });

        //Sort sortedClasses by day
        sortedClasses.sort((a, b) => {
            // console.log(a);
            // console.log(b);
            if (a.classProperties.days === undefined && b.classProperties.days === undefined) {
                return 0;
            }
            const aDay = a.classProperties.days[0];
            const bDay = b.classProperties.days[0];
            if (!aDay || !bDay) return 0;
            return dayToDate[aDay].localeCompare(dayToDate[bDay]);
        });

        const conflicts: ConflictType[] = [];

        // Two-pointer approach
        for (let i = 0; i < sortedClasses.length - 1; i++) {
            const class1 = sortedClasses[i];

            for (let j = i + 1; j < sortedClasses.length; j++) {
                const class2 = sortedClasses[j];

                // If we've moved to a different day, break inner loop
                if (dayToDate[class1.classProperties.days[0]] !== dayToDate[class2.classProperties.days[0]]) {
                    break;
                }

                // Check for time overlap
                const class1End = class1.classProperties.end_time;
                const class2Start = class2.classProperties.start_time;

                if (class2Start < class1End && (class1.classProperties.room === class2.classProperties.room || class1.classProperties.instructor_email === class2.classProperties.instructor_email)) {
                    // Conflict found
                    conflicts.push({
                        class1: class1,
                        class2: class2
                    });
                } else {
                    // No conflicts with class1 (classes sorted by start time)
                    break;
                }
            }
        }

        updateConflicts(conflicts);
    }, [combinedClasses]);

    useEffect(() => {
        if (combinedClasses.length > 0) {
            detectConflicts();
        }
    }, [detectConflicts, combinedClasses]); // Run whenever classes change


    const recomputeClass = (combinedClass: CombinedClass) => {
        // Recompute event
        const newEvent = createEventFromCombinedClass(combinedClass);

        // Update events arrays
        setAllEvents(prev => prev.map(ev =>
            ev.extendedProps?.combinedClassId === combinedClass.classData._id ? newEvent : ev
        ));
        setDisplayEvents(prev => prev.map(ev =>
            ev.extendedProps?.combinedClassId === combinedClass.classData._id ? newEvent : ev
        ));

        return combinedClass;
    }

    const updateOneClass = (newClass: CombinedClass) => {
        console.log("Updating class " + newClass.classData._id);
        // Update the class lists
        setCurrentClass(newClass);
        setClasses(prev => prev.map(c => c.classData._id === newClass.classData._id ? newClass : c));
        setDisplayClasses(prev => prev.map(c => c.classData._id === newClass.classData._id ? newClass : c));

        // Update the database (THIS IS TEMPORARY FOR THE DEMO AND PRESENTATION, MAKE SURE TO DO THE DIFFERENCES TRACKING IN THE FUTURE)
        updateCombinedClass(newClass);

        newClass = recomputeClass(newClass);

        detectConflicts();
    }

    const updateAllClasses = (newClasses: CombinedClass[], updateEvents: boolean = true) => {
        setClasses(newClasses);

        if (updateEvents) {
            const newEvents = newClasses.map(c => createEventFromCombinedClass(c));
            setAllEvents(newEvents);
        }
    }

    const updateDisplayClasses = (newDisplayClasses: CombinedClass[], updateEvents: boolean = true) => {
        setDisplayClasses(newDisplayClasses);

        if (updateEvents) {
            const newEvents = newDisplayClasses.map(c => createEventFromCombinedClass(c));
            setDisplayEvents(newEvents);
        }

        detectConflicts();
    }

    const updateConflicts = (newConflicts: ConflictType[]) => {
        setConflicts(newConflicts);
    }

    const uploadNewClasses = (uploadedClasses: CombinedClass[]) => {
        uploadedClasses.forEach(element => {
            updateCombinedClass(element)
        });

        refreshComponent("");
    }

    const unlinkTagFromClass = (tagId: string, classId: string) => {
        // Unlink tag from class
        const newTagList = new Map(tagList);
        const tagData = newTagList.get(tagId);
        if (tagData) {
            tagData.classIds.delete(classId);
            if (tagData.classIds.size === 0) {
                newTagList.delete(tagId);
            } else {
                newTagList.set(tagId, tagData);
            }
            setTagList(newTagList);
        }

        // Remove tag from class
        const newClasses = combinedClasses.map(c => {
            if (c.classData._id === classId) {
                c.classProperties.tags = c.classProperties.tags.filter(t => t !== tagId);
                updateCombinedClass(c);
            }
            return c;
        });
        setClasses(newClasses);
    }

    const unlinkAllTagsFromClass = (classId: string) => {
        const newClasses = combinedClasses.map(c => {
            if (c.classData._id === classId) {
                c.classProperties.tags = [];
                updateCombinedClass(c);
            }
            return c;
        });
        setClasses(newClasses);
    }

    const unlinkAllClassesFromTag = (tagId: string) => {
        // For each class in the tag, use unlinkTagFromClass to unlink
        const tagData = tagList.get(tagId);
        if (tagData) {
            tagData.classIds.forEach(classId => unlinkTagFromClass(tagId, classId));
        }
    }

    const unlinkAllTagsFromAllClasses = () => {
        const newClasses = combinedClasses.map(c => {
            c.classProperties.tags = [];
            updateCombinedClass(c);
            return c;
        });
        setClasses(newClasses);

        setTagList(new Map());
    }

    if (isLoading) {
        console.log("loading");
    }

    return (
        <CalendarContext.Provider value={{
            isLoading,
            unlinkTagFromClass,
            unlinkAllTagsFromClass,
            unlinkAllClassesFromTag,
            unlinkAllTagsFromAllClasses,

            detectConflicts,

            uploadNewClasses,

            setCurrentClass,
            updateOneClass,

            updateDisplayClasses,

            updateAllClasses,

            currentCombinedClass,
            allClasses: combinedClasses,
            displayClasses,
            allEvents,
            displayEvents,
            tagList,
            allTags,
            conflicts,
        }}>
            {children}
            {reset}
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
// if (currentCombinedClass) {
//     Object.keys(currentCombinedClass.classData).forEach(key => {
//         console.log(key, currentCombinedClass.classData[key as keyof typeof currentCombinedClass.classData]);
//     });
// }