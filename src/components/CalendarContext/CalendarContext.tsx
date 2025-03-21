"use client"

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { CalendarAction, CalendarContextType, CalendarState, CombinedClass, ConflictType, ReactNodeChildren, tagListType } from '@/lib/types';
import { EventInput } from '@fullcalendar/core/index.js';
import { updateCombinedClasses, loadCombinedClasses, loadAllTags } from '@/lib/utils';
import { createEventsFromCombinedClass, dayToDate, initialCalendarState } from '@/lib/common';

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

// Helper functions
const createEventsFromClasses = (classes: CombinedClass[]): EventInput[] => {
    const events: EventInput[] = [];

    if (classes.length === 0) return events;

    classes.forEach(cls => {
        const classEvents: EventInput[] = createEventsFromCombinedClass(cls);
        cls.events = classEvents;
        events.push(...classEvents);
    });

    return events;
};

const buildTagMapping = (classes: CombinedClass[]): tagListType => {
    const mapping: tagListType = new Map();

    classes.forEach(cls => {
        cls.properties.tags?.forEach(tag => {
            if (!mapping.has(tag)) {
                mapping.set(tag, { classIds: new Set() });
            }
            mapping.get(tag)?.classIds.add(cls._id);
        });
    });

    return mapping;
};

// Rebuilt for efficiency - single sort with compound comparator
const detectClassConflicts = (classes: CombinedClass[]): ConflictType[] => {
    // Single sort with compound key (day, start_time)
    const sortedClasses = [...classes].sort((a, b) => {
        // First by day
        const aDay = a.properties.days?.[0];
        const bDay = b.properties.days?.[0];

        if (!aDay || !bDay) return 0;

        const dayCompare = dayToDate[aDay].localeCompare(dayToDate[bDay]);
        if (dayCompare !== 0) return dayCompare;

        // Then by start time
        const aStart = a.properties.start_time || '';
        const bStart = b.properties.start_time || '';
        return aStart.localeCompare(bStart);
    });

    const conflicts: ConflictType[] = [];
    const dayConflictCache = new Map(); // Cache conflicts by day to avoid redundant checks

    // More efficient conflict detection
    for (let i = 0; i < sortedClasses.length - 1; i++) {
        const class1 = sortedClasses[i];
        const class1Day = class1.properties.days?.[0];
        const class1End = class1.properties.end_time;

        if (!class1Day || !class1End) continue;

        // Cache key includes room and instructor to check specific conflicts
        const cacheKey = class1Day + class1.properties.room + class1.properties.instructor_email;
        if (!dayConflictCache.has(cacheKey)) {
            dayConflictCache.set(cacheKey, []);
        }

        // Only check against classes with same day
        for (let j = i + 1; j < sortedClasses.length; j++) {
            const class2 = sortedClasses[j];
            const class2Day = class2.properties.days?.[0];
            const class2Start = class2.properties.start_time;

            if (!class2Day || !class2Start) continue;

            // If we've moved to a different day, break
            if (class1Day !== class2Day) break;

            // Check for time overlap and conflict condition
            if (class2Start < class1End) {
                // Only check room conflict if both rooms exist and are non-empty
                const roomConflict = class1.properties.room &&
                    class2.properties.room &&
                    class1.properties.room === class2.properties.room;

                // Only check instructor conflict if both instructor emails exist and are non-empty
                const instructorConflict = class1.properties.instructor_email &&
                    class2.properties.instructor_email &&
                    class1.properties.instructor_email === class2.properties.instructor_email ||
                    class1.properties.instructor_name &&
                    class2.properties.instructor_name &&
                    class1.properties.instructor_name === class2.properties.instructor_name;

                // Determine conflict type
                let conflictType = null;
                if (roomConflict && instructorConflict) {
                    conflictType = "both";
                } else if (roomConflict) {
                    conflictType = "room";
                } else if (instructorConflict) {
                    conflictType = "instructor";
                }

                // Register conflict only if time overlaps AND there's either a room or instructor conflict
                if (conflictType) {
                    conflicts.push({
                        class1,
                        class2,
                        conflictType
                    });
                    dayConflictCache.get(cacheKey).push(class2._id);
                }
            } else if (class2Start >= class1End) {
                // No more possible conflicts with class1
                break;
            }
        }
    }

    return conflicts;
};

// Reducer Function
function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
    switch (action.type) {
        case 'INITIALIZE_DATA': {
            const classes = action.payload.classes;
            const events = createEventsFromClasses(classes);
            const tagMapping = buildTagMapping(classes);

            return {
                ...state,
                classes: {
                    all: classes,
                    display: classes,
                    current: state.classes.current
                },
                events: {
                    all: events,
                    display: events
                },
                tags: {
                    all: action.payload.tags,
                    mapping: tagMapping
                },
                status: {
                    loading: false,
                    error: null
                }
            };
        }

        case 'SET_DISPLAY_CLASSES': {
            const displayClasses = action.payload;
            const displayEvents = createEventsFromClasses(displayClasses);

            return {
                ...state,
                classes: {
                    ...state.classes,
                    display: displayClasses
                },
                events: {
                    ...state.events,
                    display: displayEvents
                }
            };
        }

        case 'SET_CURRENT_CLASS': {
            return {
                ...state,
                classes: {
                    ...state.classes,
                    current: action.payload
                }
            };
        }

        case 'UPDATE_CLASS': {
            const updatedClass = action.payload;
            const updatedEvent = createEventsFromCombinedClass(updatedClass);

            // Update the class in all collections
            const updateClassById = (classes: CombinedClass[]) =>
                classes.map(c => c._id === updatedClass._id ? updatedClass : c);

            // Update the event in all collections
            const updateEventById = (events: EventInput[]) =>
                events.map(e =>
                    e.extendedProps?.combinedClassId === updatedClass._id ? updatedEvent : e
                );

            return {
                ...state,
                classes: {
                    all: updateClassById(state.classes.all),
                    display: updateClassById(state.classes.display),
                    current: updatedClass
                },
                events: {
                    all: updateEventById(state.events.all),
                    display: updateEventById(state.events.display)
                }
            };
        }

        case 'SET_CONFLICTS': {
            return {
                ...state,
                conflicts: action.payload
            };
        }

        case 'SET_LOADING': {
            return {
                ...state,
                status: {
                    ...state.status,
                    loading: action.payload
                }
            };
        }

        case 'SET_ERROR': {
            return {
                ...state,
                status: {
                    ...state.status,
                    error: action.payload
                }
            };
        }

        case 'UNLINK_TAG_FROM_CLASS': {
            const { tagId, classId } = action.payload;

            // Update tag mapping
            const newMapping = new Map(state.tags.mapping);
            const tagData = newMapping.get(tagId);

            if (tagData) {
                tagData.classIds.delete(classId);
                if (tagData.classIds.size === 0) {
                    newMapping.delete(tagId);
                } else {
                    newMapping.set(tagId, tagData);
                }
            }

            // Update classes
            const updatedClasses = state.classes.all.map(c => {
                if (c._id === classId) {
                    return {
                        ...c,
                        properties: {
                            ...c.properties,
                            tags: c.properties.tags.filter(t => t !== tagId)
                        }
                    };
                }
                return c;
            });

            return {
                ...state,
                classes: {
                    all: updatedClasses,
                    display: state.classes.display.map(c =>
                        c._id === classId ?
                            updatedClasses.find(uc => uc._id === classId)! :
                            c
                    ),
                    current: state.classes.current?._id === classId ?
                        updatedClasses.find(c => c._id === classId) :
                        state.classes.current
                },
                tags: {
                    ...state.tags,
                    mapping: newMapping
                }
            };
        }

        case 'UNLINK_ALL_TAGS_FROM_CLASS': {
            const classId = action.payload;

            // Update classes
            const updatedClasses = state.classes.all.map(c => {
                if (c._id === classId) {
                    return {
                        ...c,
                        properties: {
                            ...c.properties,
                            tags: []
                        }
                    };
                }
                return c;
            });

            // Update tag mapping
            const newMapping = new Map(state.tags.mapping);
            for (const [tagId, tagData] of newMapping.entries()) {
                tagData.classIds.delete(classId);
                if (tagData.classIds.size === 0) {
                    newMapping.delete(tagId);
                }
            }

            return {
                ...state,
                classes: {
                    all: updatedClasses,
                    display: state.classes.display.map(c =>
                        c._id === classId ?
                            updatedClasses.find(uc => uc._id === classId)! :
                            c
                    ),
                    current: state.classes.current?._id === classId ?
                        updatedClasses.find(c => c._id === classId) :
                        state.classes.current
                },
                tags: {
                    ...state.tags,
                    mapping: newMapping
                }
            };
        }

        case 'UNLINK_ALL_CLASSES_FROM_TAG': {
            const tagId = action.payload;
            const tagData = state.tags.mapping.get(tagId);
            const affectedClassIds = tagData ? Array.from(tagData.classIds) : [];

            // Update classes
            const updatedClasses = state.classes.all.map(c => {
                if (affectedClassIds.includes(c._id)) {
                    return {
                        ...c,
                        properties: {
                            ...c.properties,
                            tags: c.properties.tags.filter(t => t !== tagId)
                        }
                    };
                }
                return c;
            });

            // Update tag mapping
            const newMapping = new Map(state.tags.mapping);
            newMapping.delete(tagId);

            return {
                ...state,
                classes: {
                    all: updatedClasses,
                    display: state.classes.display.map(c =>
                        affectedClassIds.includes(c._id) ?
                            updatedClasses.find(uc => uc._id === c._id)! :
                            c
                    ),
                    current: state.classes.current && affectedClassIds.includes(state.classes.current._id) ?
                        updatedClasses.find(c => c._id === state.classes.current?._id) :
                        state.classes.current
                },
                tags: {
                    ...state.tags,
                    mapping: newMapping
                }
            };
        }

        case 'UNLINK_ALL_TAGS_FROM_ALL_CLASSES': {
            // Update all classes to have empty tags
            const updatedClasses = state.classes.all.map(c => ({
                ...c,
                classProperties: {
                    ...c.properties,
                    tags: []
                }
            }));

            return {
                ...state,
                classes: {
                    all: updatedClasses,
                    display: updatedClasses,
                    current: state.classes.current ? {
                        ...state.classes.current,
                        properties: {
                            ...state.classes.current.properties,
                            tags: []
                        }
                    } : undefined
                },
                tags: {
                    ...state.tags,
                    mapping: new Map()
                }
            };
        }

        case 'UPLOAD_CLASSES': {
            const newClasses = [...state.classes.all, ...action.payload];
            const events = createEventsFromClasses(newClasses);
            const tagMapping = buildTagMapping(newClasses);

            return {
                ...state,
                classes: {
                    all: newClasses,
                    display: newClasses,
                    current: state.classes.current
                },
                events: {
                    all: events,
                    display: events
                },
                tags: {
                    ...state.tags,
                    mapping: tagMapping
                }
            };
        }

        default:
            return state;
    }
}

export const CalendarProvider = ({ children }: ReactNodeChildren) => {
    const [state, dispatch] = useReducer(calendarReducer, initialCalendarState);
    const [forceUpdate, setForceUpdate] = useState('');

    // Load initial data
    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                dispatch({ type: 'SET_LOADING', payload: true });

                const [allClasses, allTags] = await Promise.all([
                    loadCombinedClasses(null),
                    loadAllTags()
                ]);

                console.log("ALL CLASSES\n", allClasses);

                if (mounted) {
                    dispatch({
                        type: 'INITIALIZE_DATA',
                        payload: { classes: allClasses, tags: allTags }
                    });
                }
            } catch (err) {
                if (mounted) {
                    console.error('Error loading data:', err);
                    dispatch({
                        type: 'SET_ERROR',
                        payload: err instanceof Error ? err.message : 'Failed to load data'
                    });
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            }
        };

        loadData();
        return () => { mounted = false; };
    }, [forceUpdate]);

    // Detect conflicts whenever classes change
    useEffect(() => {
        if (state.classes.all.length > 0) {
            const conflicts = detectClassConflicts(state.classes.all);
            dispatch({ type: 'SET_CONFLICTS', payload: conflicts });
        }
    }, [state.classes.all]);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        // Classes
        allClasses: state.classes.all,
        displayClasses: state.classes.display,
        currentCombinedClass: state.classes.current,

        // Events
        allEvents: state.events.all,
        displayEvents: state.events.display,

        // Tags
        allTags: state.tags.all,
        tagList: state.tags.mapping,

        // Conflicts
        conflicts: state.conflicts,

        // Actions
        setCurrentClass: (cls: CombinedClass) => {
            console.log('SET_CURRENT_CLASS');
            dispatch({ type: 'SET_CURRENT_CLASS', payload: cls });
        },

        updateOneClass: (cls: CombinedClass) => {
            updateCombinedClasses([cls]); // Update in database
            console.log('UPDATE_CLASS');
            dispatch({ type: 'UPDATE_CLASS', payload: cls });
        },

        updateAllClasses: (classes: CombinedClass[]) => {
            const payload = { classes, tags: state.tags.all };
            console.log('INITIALIZE_DATA');
            dispatch({ type: 'INITIALIZE_DATA', payload });
        },

        updateDisplayClasses: (classes: CombinedClass[]) => {
            console.log('SET_DISPLAY_CLASSES');
            dispatch({ type: 'SET_DISPLAY_CLASSES', payload: classes });
        },

        detectConflicts: () => {
            const conflicts = detectClassConflicts(state.classes.all); // Changed this from state.classes.display to state.classes.all
            console.log('SET_CONFLICTS');
            dispatch({ type: 'SET_CONFLICTS', payload: conflicts });
        },

        unlinkTagFromClass: (tagId: string, classId: string) => {
            console.log('UNLINK_TAG_FROM_CLASS');
            dispatch({ type: 'UNLINK_TAG_FROM_CLASS', payload: { tagId, classId } });

            // Find and update the class in the database
            const classToUpdate = state.classes.all.find(c => c._id === classId);
            if (classToUpdate) {
                const updatedClass = {
                    ...classToUpdate,
                    classProperties: {
                        ...classToUpdate.properties,
                        tags: classToUpdate.properties.tags.filter(t => t !== tagId)
                    }
                };
                updateCombinedClasses([updatedClass]);
            }
        },

        unlinkAllTagsFromClass: (classId: string) => {
            console.log('UNLINK_ALL_TAGS_FROM_CLASS');
            dispatch({ type: 'UNLINK_ALL_TAGS_FROM_CLASS', payload: classId });

            // Find and update the class in the database
            const classToUpdate = state.classes.all.find(c => c._id === classId);
            if (classToUpdate) {
                const updatedClass = {
                    ...classToUpdate,
                    classProperties: {
                        ...classToUpdate.properties,
                        tags: []
                    }
                };
                updateCombinedClasses([updatedClass]);
            }
        },

        unlinkAllClassesFromTag: (tagId: string) => {
            console.log('UNLINK_ALL_CLASSES_FROM_TAG');
            dispatch({ type: 'UNLINK_ALL_CLASSES_FROM_TAG', payload: tagId });

            // Update all affected classes in the database
            const tagData = state.tags.mapping.get(tagId);
            if (tagData) {
                state.classes.all
                    .filter(c => tagData.classIds.has(c._id))
                    .forEach(c => {
                        const updatedClass = {
                            ...c,
                            classProperties: {
                                ...c.properties,
                                tags: c.properties.tags.filter(t => t !== tagId)
                            }
                        };
                        updateCombinedClasses([updatedClass]);
                    });
            }
        },

        unlinkAllTagsFromAllClasses: () => {
            console.log('UNLINK_ALL_TAGS_FROM_ALL_CLASSES');
            dispatch({ type: 'UNLINK_ALL_TAGS_FROM_ALL_CLASSES' });

            // Update all classes in the database
            state.classes.all.forEach(c => {
                const updatedClass = {
                    ...c,
                    classProperties: {
                        ...c.properties,
                        tags: []
                    }
                };
                updateCombinedClasses([updatedClass]);
            });
        },

        uploadNewClasses: (classes: CombinedClass[]) => {
            // Use bulk update instead of individual updates
            updateCombinedClasses(classes)
                .then(() => {
                    // Update local state
                    console.log('UPLOAD_CLASSES');
                    dispatch({ type: 'UPLOAD_CLASSES', payload: classes });

                    // Force refresh data from server
                    setForceUpdate(Date.now().toString());
                })
                .catch(error => {
                    console.error("Error uploading classes:", error);
                    console.log('SET_ERROR');
                    dispatch({
                        type: 'SET_ERROR',
                        payload: 'Failed to upload classes. Please try again.'
                    });
                });
        }
    }), [state]);

    return (
        <CalendarContext.Provider value={contextValue}>
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