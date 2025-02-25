"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { CalendarContextType, CombinedClass, ConflictType, ProviderProps, tagListType } from '@/lib/types';
import { EventInput } from '@fullcalendar/core/index.js';
import { deleteTag, loadAllCombinedClasses, loadAllTags, updateCombinedClass } from '@/lib/utils';
import { createEventFromCombinedClass, dayMapping, days } from '@/lib/common';

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

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
    const [conflicts, setConflicts] = useState<ConflictType[]>([]);

    useEffect(() => {
        let mounted = true;

        const loadClasses = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const allClasses = await loadAllCombinedClasses();
                // console.log(JSON.stringify(allClasses));
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

    useEffect(() => {
        if (combinedClasses.length > 0) {
            detectConflicts();
        }
    }, [combinedClasses]); // Run whenever classes change

    
    const RecomputeClass = (combinedClass: CombinedClass) => {
        // Recompute event
        const fullDay = combinedClass.classProperties.days[0];
        const shortDay = dayMapping[fullDay] || fullDay;
        const convertedDay = days[shortDay] || '2025-01-06';
        const dateStringStart = convertedDay + 'T' + combinedClass.classProperties.start_time;
        const dateStringEnd = convertedDay + 'T' + combinedClass.classProperties.end_time;
    
        const newEvent = {
            title: combinedClass.classData.title,
            start: dateStringStart,
            end: dateStringEnd,
            extendedProps: {
                combinedClassId: combinedClass.classData._id,
            }
        };
    
        // Update events arrays
        setAllEvents(prev => prev.map(ev =>
            ev.extendedProps?.combinedClassId === combinedClass.classData._id ? newEvent : ev
        ));
        setDisplayEvents(prev => prev.map(ev =>
            ev.extendedProps?.combinedClassId === combinedClass.classData._id ? newEvent : ev
        ));

        return combinedClass;
    }


    const updateAllClasses = (newClasses: CombinedClass[]) => {
        setClasses(newClasses);
    }

    const updateDisplayClasses = (newDisplayClasses: CombinedClass[]) => {
        setDisplayClasses(newDisplayClasses);
        detectConflicts();
    }

    const updateDisplayEvents = (newDisplayEvents: EventInput[]) => {
        setDisplayEvents(newDisplayEvents);
        console.log("Display events updated" + JSON.stringify(newDisplayEvents));
    }

    const updateAllEvents = (newEvents: EventInput[]) => {
        setAllEvents(newEvents);
    }

    const updateConflicts = (newConflicts: ConflictType[]) => {
        setConflicts(newConflicts);
    }

    const uploadNewClasses = (uploadedClasses: CombinedClass[]) => {
        console.log("uploaded classes: ");
        console.log(uploadedClasses);
        uploadedClasses.forEach(element => {
            element = RecomputeClass(element);
            element.event = createEventFromCombinedClass(element);
        });

        updateAllClasses(uploadedClasses);
        updateDisplayClasses(uploadedClasses);

        detectConflicts();
    }

    const updateCurrentClass = (newClass: CombinedClass) => {
        console.log("Updating current class " + newClass.classData._id);
        // Update the class lists
        setCurrClass(newClass);
        setClasses(prev => prev.map(c => c.classData._id === newClass.classData._id ? newClass : c));
        setDisplayClasses(prev => prev.map(c => c.classData._id === newClass.classData._id ? newClass : c));

        // Update the database (THIS IS TEMPORARY FOR THE DEMO AND PRESENTATION, MAKE SURE TO DO THE DIFFERENCES TRACKING IN THE FUTURE)
        updateCombinedClass(newClass);

        newClass = RecomputeClass(newClass);

        detectConflicts();
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
        const newTagList = new Map(tagList);
        newTagList.delete(tagId);
        setTagList(newTagList);

        const newClasses = combinedClasses.map(c => {
            c.classProperties.tags = c.classProperties.tags.filter(t => t !== tagId);
            updateCombinedClass(c);
            return c;
        });
        setClasses(newClasses);
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

    const detectConflicts = () => {
        // Check for conflicts
        // Sort by start time
        const sortedClasses = combinedClasses.slice().sort((a, b) => {
            const aStart = a.classProperties.start_time;
            const bStart = b.classProperties.start_time;
            return aStart.localeCompare(bStart);
        });

        //Sort sortedClasses by day
        sortedClasses.sort((a, b) => {
            const aDay = a.classProperties.days[0];
            const bDay = b.classProperties.days[0];
            return days[aDay].localeCompare(days[bDay]);
        });

        // Print out each class title in the sorted class
        // console.log("Sorted classes:");
        // sortedClasses.forEach(c => console.log(c.classData.title));

        console.log("Sorted classes:", sortedClasses.map(c => c.classData.title).join(", "));
        // Check for conflicts using two pointers

        const conflicts: ConflictType[] = [];

        // Two-pointer approach
        for (let i = 0; i < sortedClasses.length - 1; i++) {
            const class1 = sortedClasses[i];

            for (let j = i + 1; j < sortedClasses.length; j++) {
                const class2 = sortedClasses[j];

                // If we've moved to a different day, break inner loop
                if (days[class1.classProperties.days[0]] !== days[class2.classProperties.days[0]]) {
                    break;
                }

                // Check for time overlap
                const class1End = class1.classProperties.end_time;
                const class2Start = class2.classProperties.start_time;

                if (class2Start < class1End) {
                    // Conflict found
                    conflicts.push({
                        class1: class1,
                        class2: class2
                    });
                } else {
                    // No more possible conflicts with class1
                    // Since classes are sorted by start time
                    break;
                }
            }
        }

        // Return conflicts array

        // Console log the classes in conflicts by title only
        console.log("Conflicts:");
        conflicts.forEach(c => console.log(JSON.stringify(c.class1.classData.title), JSON.stringify(c.class2.classData.title)));

        updateConflicts(conflicts);
    }


    return (
        <CalendarContext.Provider value={{
            isLoading,
            error,
            currCombinedClass,
            setCurrClass,
            updateCurrentClass,
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
            unlinkTagFromClass,
            unlinkAllTagsFromClass,
            unlinkAllClassesFromTag,
            unlinkAllTagsFromAllClasses,
            detectConflicts,
            conflicts,
            uploadNewClasses
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