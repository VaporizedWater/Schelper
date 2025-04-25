"use client"

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { CalendarAction, CalendarContextType, CalendarState, CombinedClass, ConflictType, FacultyType, ReactNodeChildren, tagListType } from '@/lib/types';
import { updateCombinedClasses, loadCalendar, loadTags, deleteCombinedClasses, loadFaculty, deleteStoredFaculty, updateFaculty } from '@/lib/DatabaseUtils';
import { initialCalendarState, newDefaultEmptyCalendar, newDefaultEmptyClass } from '@/lib/common';
import { useSession } from 'next-auth/react';
import { EventInput } from '@fullcalendar/core/index.js';

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

// Helper functions
const buildTagMapping = (classes: CombinedClass[], existingMapping?: tagListType): tagListType => {
    const mapping: tagListType = existingMapping || new Map();

    classes.forEach(cls => {
        cls.properties.tags?.forEach((tag) => {
            if (!mapping.has(tag.tagName)) {
                mapping.set(tag.tagName, { tagCategory: tag.tagCategory, classIds: new Set() });
            }
            mapping.get(tag.tagName)?.classIds.add(cls._id);
        });
    });

    return mapping;
};

// Helper function to merge faculty entries
const mergeFacultyEntries = (existingFaculty: FacultyType[] = [], newFaculty: FacultyType[] = []): FacultyType[] => {
    // Create a map of existing faculty for quick lookups
    const facultyMap = new Map<string, FacultyType>();
    existingFaculty.forEach(faculty => {
        if (faculty.email) {
            facultyMap.set(faculty.email, { ...faculty });
        }
    });

    // Process each new faculty entry
    newFaculty.forEach(newEntry => {
        if (!newEntry.email) return;

        if (facultyMap.has(newEntry.email)) {
            // Merge with existing entry
            const existingEntry = facultyMap.get(newEntry.email)!;
            facultyMap.set(newEntry.email, {
                ...existingEntry,
                unavailability: {
                    Mon: mergeDaySlots(existingEntry.unavailability.Mon, newEntry.unavailability.Mon),
                    Tue: mergeDaySlots(existingEntry.unavailability.Tue, newEntry.unavailability.Tue),
                    Wed: mergeDaySlots(existingEntry.unavailability.Wed, newEntry.unavailability.Wed),
                    Thu: mergeDaySlots(existingEntry.unavailability.Thu, newEntry.unavailability.Thu),
                    Fri: mergeDaySlots(existingEntry.unavailability.Fri, newEntry.unavailability.Fri),
                }
            });
        } else {
            // Add new entry
            facultyMap.set(newEntry.email, { ...newEntry });
        }
    });

    // Convert the map back to an array
    return Array.from(facultyMap.values());
};

// Helper function to merge time slots for a specific day
const mergeDaySlots = (
    existingSlots: EventInput[] = [],
    newSlots: EventInput[] = []
): EventInput[] => {
    // If either array is empty, just return the other (or empty if both empty)
    if (existingSlots.length === 0) return [...newSlots];
    if (newSlots.length === 0) return [...existingSlots];

    // Helper function to convert time string "HH:MM" to minutes for easier comparison
    const timeToMinutes = (timeStr: string | undefined): number => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // Helper function to convert minutes back to time string "HH:MM"
    const minutesToTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    // Create a type-safe array of interval objects for processing
    type TimeInterval = { start: number; end: number; originalSlot: EventInput };

    // Combine all slots and convert to interval objects with numeric values
    const intervals: TimeInterval[] = [
        ...existingSlots.map(slot => ({
            start: timeToMinutes(slot.start as string),
            end: timeToMinutes(slot.end as string),
            originalSlot: slot
        })),
        ...newSlots.map(slot => ({
            start: timeToMinutes(slot.start as string),
            end: timeToMinutes(slot.end as string),
            originalSlot: slot
        }))
    ];

    // Sort by start time 
    intervals.sort((a, b) => a.start - b.start);

    // Merge overlapping intervals
    const mergedIntervals: TimeInterval[] = [];

    for (const interval of intervals) {
        // If this is the first interval or if it doesn't overlap with the last merged interval
        if (mergedIntervals.length === 0 || interval.start > mergedIntervals[mergedIntervals.length - 1].end) {
            mergedIntervals.push(interval);
        } else {
            // Overlapping case: extend the end time of the last merged interval if needed
            mergedIntervals[mergedIntervals.length - 1].end = Math.max(
                mergedIntervals[mergedIntervals.length - 1].end,
                interval.end
            );
        }
    }

    // Convert back to EventInput format
    return mergedIntervals.map(interval => {
        // Start with properties from one of the original slots
        const baseSlot = { ...interval.originalSlot };

        // Update only the start and end times
        return {
            ...baseSlot,
            start: minutesToTime(interval.start),
            end: minutesToTime(interval.end)
        };
    });
};

const detectClassConflicts = (classes: CombinedClass[]): ConflictType[] => {
    const conflicts: ConflictType[] = [];

    // Helper to convert time string to minutes for easier comparison
    const timeToMinutes = (timeStr: string | undefined): number => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // Process all class pairs - no need for sorting
    for (let i = 0; i < classes.length; i++) {
        const class1 = classes[i];

        // Skip classes with no days or times
        if (!class1.properties.days?.length || !class1.properties.start_time || !class1.properties.end_time) {
            continue;
        }

        const class1StartMinutes = timeToMinutes(class1.properties.start_time);
        const class1EndMinutes = timeToMinutes(class1.properties.end_time);

        for (let j = i + 1; j < classes.length; j++) {
            const class2 = classes[j];

            // Skip classes with no days or times
            if (!class2.properties.days?.length || !class2.properties.start_time || !class2.properties.end_time) {
                continue;
            }

            const class2StartMinutes = timeToMinutes(class2.properties.start_time);
            const class2EndMinutes = timeToMinutes(class2.properties.end_time);

            // Check for time overlap (classes run at same time)
            const hasTimeOverlap = !(class1EndMinutes <= class2StartMinutes || class2EndMinutes <= class1StartMinutes);

            if (hasTimeOverlap) {
                // Check if any day overlaps between the two classes
                const dayOverlap = class1.properties.days.some(day1 =>
                    class2.properties.days.some(day2 => day1 === day2)
                );

                const sameExactTime =
                    class1.properties.start_time && class1.properties.end_time && class2.properties.start_time && class2.properties.end_time &&
                    class1.properties.start_time === class2.properties.start_time &&
                    class1.properties.end_time === class2.properties.end_time;

                const sameExactName =
                    (class1.data.course_subject && class1.data.course_num && class2.data.course_subject && class2.data.course_num &&
                        class1.data.course_subject === class2.data.course_subject &&
                        class1.data.course_num === class2.data.course_num) ||
                    (class1.data.title && class1.data.title && class1.data.title === class2.data.title);

                const sameInstructor = (class1.properties.instructor_email &&
                    class2.properties.instructor_email &&
                    class1.properties.instructor_email === class2.properties.instructor_email) ||
                    (class1.properties.instructor_name &&
                        class2.properties.instructor_name &&
                        class1.properties.instructor_name === class2.properties.instructor_name);

                if (dayOverlap && !sameExactName) {
                    // Only check room conflict if both rooms exist and are non-empty
                    const roomConflict = class1.properties.room &&
                        class2.properties.room &&
                        class1.properties.room !== 'Off Campus' &&
                        class2.properties.room !== 'Off Campus' &&
                        class1.properties.room === class2.properties.room;


                    // Check instructor conflict via email or name
                    const instructorConflict = !sameExactTime && sameInstructor;

                    // Check for cohort conflict
                    const cohortConflict = class1.properties.cohort &&
                        class2.properties.cohort &&
                        class1.properties.cohort === class2.properties.cohort;

                    // Determine conflict type
                    let conflictType = null;

                    if (roomConflict && instructorConflict && cohortConflict) {
                        conflictType = "all";
                    } else if (roomConflict && instructorConflict && !cohortConflict) {
                        conflictType = "room + instructor";
                    } else if (roomConflict && cohortConflict && !instructorConflict) {
                        conflictType = "room + cohort";
                    } else if (instructorConflict && cohortConflict && !roomConflict) {
                        conflictType = "instructor + cohort";
                    } else if (roomConflict && !instructorConflict && !cohortConflict) {
                        conflictType = "room";
                    } else if (instructorConflict && !roomConflict && !cohortConflict) {
                        conflictType = "instructor";
                    } else if (cohortConflict && !roomConflict && !instructorConflict) {
                        conflictType = "cohort";
                    }

                    if (conflictType) {
                        conflicts.push({
                            class1,
                            class2,
                            conflictType
                        });
                    }
                }
            }
        }
    }

    return conflicts;
};

// Reducer Function
function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
    switch (action.type) {
        case 'INITIALIZE_DATA': {

            // console.time("INITIALIZE_DATA");
            const classes = action.payload.classes;
            // const events = createEventsFromClasses(classes);
            const tagMapping = buildTagMapping(classes, action.payload.tags);

            return {
                ...state,
                classes: {
                    all: classes,
                    // display: classes,
                    current: state.classes.current
                },
                tags: tagMapping,
                status: {
                    loading: false,
                    error: null
                },
                user: state.user,
                currentCalendar: action.payload.currentCalendar,
                faculty: action.payload.faculty || state.faculty,
                conflictyPropertyChanged: !state.conflictyPropertyChanged
            };
        }

        case 'TOGGLE_CONFLICT_PROPERTY_CHANGED': {
            return {
                ...state,
                conflictyPropertyChanged: action.payload
            }
        }

        case 'UPDATE_FACULTY': {
            return {
                ...state,
                faculty: action.payload
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
            // console.time("UPDATE_CLASS");
            const updatedClass = action.payload;
            // const updatedEvents = createEventsFromCombinedClass(updatedClass);

            // Update the class in all collections
            const updateClassById = (classes: CombinedClass[]) =>
                classes.map(c => c._id === updatedClass._id ? updatedClass : c);

            // console.timeEnd("UPDATE_CLASS");
            return {
                ...state,
                classes: {
                    all: updateClassById(state.classes.all),
                    // display: updateClassById(state.classes.display),
                    current: updatedClass
                },
            };
        }

        case 'UPDATE_ALL_CLASSES': {
            const classes = action.payload;
            const tagMapping = buildTagMapping(classes, state.tags);

            return {
                ...state,
                classes: {
                    all: classes,
                    current: state.classes.current
                },
                tags: tagMapping
            }
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
            const newMapping = new Map(state.tags);
            const tagCategoryAndClassIds = newMapping.get(tagId);

            if (tagCategoryAndClassIds) {
                tagCategoryAndClassIds.classIds.delete(classId);
                if (tagCategoryAndClassIds.classIds.size === 0) {
                    newMapping.delete(tagId);
                } else {
                    newMapping.set(tagId, tagCategoryAndClassIds);
                }
            }

            // Update classes
            const updatedClasses = state.classes.all.map(c => {
                if (c._id === classId) {
                    return {
                        ...c,
                        properties: {
                            ...c.properties,
                            tags: c.properties.tags.filter(t => t.tagName !== tagId)
                        }
                    };
                }
                return c;
            });

            return {
                ...state,
                classes: {
                    all: updatedClasses,
                    current: state.classes.current?._id === classId ?
                        updatedClasses.find(c => c._id === classId) :
                        state.classes.current
                },
                tags: newMapping
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
            const newMapping = new Map(state.tags);
            for (const [tagId, tagCategoryAndClassIds] of newMapping.entries()) {
                tagCategoryAndClassIds.classIds.delete(classId);
                if (tagCategoryAndClassIds.classIds.size === 0) {
                    newMapping.delete(tagId);
                }
            }

            return {
                ...state,
                classes: {
                    all: updatedClasses,
                    current: state.classes.current?._id === classId ?
                        updatedClasses.find(c => c._id === classId) :
                        state.classes.current
                },
                tags: newMapping
            };
        }

        case 'UNLINK_ALL_CLASSES_FROM_TAG': {
            const tagId = action.payload;
            const classIds = state.tags.get(tagId)?.classIds;
            const affectedClassIds = classIds ? Array.from(classIds) : [];

            // Update classes
            const updatedClasses = state.classes.all.map(c => {
                if (affectedClassIds.includes(c._id)) {
                    return {
                        ...c,
                        properties: {
                            ...c.properties,
                            tags: c.properties.tags.filter(t => t.tagName !== tagId)
                        }
                    };
                }
                return c;
            });

            // Update tag mapping
            const newMapping = new Map(state.tags);
            newMapping.delete(tagId);

            return {
                ...state,
                classes: {
                    all: updatedClasses,
                    current: state.classes.current && affectedClassIds.includes(state.classes.current._id) ?
                        updatedClasses.find(c => c._id === state.classes.current?._id) :
                        state.classes.current
                },
                tags: newMapping
            };
        }

        case 'UNLINK_ALL_TAGS_FROM_ALL_CLASSES': {
            // Update all classes to have empty tags
            const updatedClasses = state.classes.all.map(c => ({
                ...c,
                properties: {
                    ...c.properties,
                    tags: []
                }
            }));

            return {
                ...state,
                classes: {
                    all: updatedClasses,
                    // display: updatedClasses,
                    current: state.classes.current ? {
                        ...state.classes.current,
                        properties: {
                            ...state.classes.current.properties,
                            tags: []
                        }
                    } : undefined
                },
                tags: new Map()
            };
        }

        case 'UPLOAD_CLASSES': {
            // console.time("UPLOAD_CLASSES");
            const newClasses = [...state.classes.all, ...action.payload];
            const newMapping = buildTagMapping(newClasses);
            // console.timeEnd("UPLOAD_CLASSES");

            return {
                ...state,
                classes: {
                    all: newClasses,
                    // display: newClasses,
                    current: state.classes.current
                },
                tags: newMapping,
                conflictyPropertyChanged: !state.conflictyPropertyChanged
            };
        }

        case 'DELETE_CLASS': {
            const classIdToDelete = action.payload;

            // Filter out deleted classes in a single pass each
            const filteredAllClasses = state.classes.all.filter(c => c._id !== classIdToDelete);
            // const filteredDisplayClasses = state.classes.display.filter(c => c._id !== classIdToDelete);

            // Update tag mapping
            const newMapping = new Map(state.tags);
            for (const [tagName, tagCategoryAndclassIds] of newMapping.entries()) {
                // Process all tag mappings at once
                let modified = false;

                const classIds = tagCategoryAndclassIds.classIds;

                if (classIds.has(classIdToDelete)) {
                    classIds.delete(classIdToDelete);
                    modified = true;
                }

                // Remove empty tag entries
                if (modified && classIds.size === 0) {
                    newMapping.delete(tagName);
                }
            }

            // Handle current class (unset if it's one of the deleted classes)
            const newCurrentClass = state.classes.current && classIdToDelete === state.classes.current._id
                ? undefined
                : state.classes.current;

            return {
                ...state,
                classes: {
                    all: filteredAllClasses,
                    // display: filteredDisplayClasses,
                    current: newCurrentClass
                },
                tags: newMapping,
                conflictyPropertyChanged: !state.conflictyPropertyChanged
            };
        }

        default:
            return state;
    }
}

export const CalendarProvider = ({ children }: ReactNodeChildren) => {
    const [state, dispatch] = useReducer(calendarReducer, initialCalendarState);
    const [forceUpdate, setForceUpdate] = useState('');
    const { data: session } = useSession();

    // Load initial data
    useEffect(() => {
        // console.time("CalendarProvider:initialLoad");
        let mounted = true;

        const loadData = async () => {
            // console.time("loadData");
            try {
                dispatch({ type: 'SET_LOADING', payload: true });

                if (session?.user?.email) {
                    const [calendar, allTags, faculty] = await Promise.all([
                        loadCalendar(session?.user?.email),
                        loadTags(),
                        loadFaculty()
                    ]);

                    // console.log("ALL TAGS", allTags);
                    // console.log("FACULTY", faculty);

                    const classes = calendar.classes;
                    calendar.classes = [];

                    if (mounted) {
                        dispatch({
                            type: 'INITIALIZE_DATA',
                            payload: { classes: classes, tags: allTags, currentCalendar: calendar, faculty: faculty }
                        });
                    }
                } else {
                    dispatch({
                        type: 'INITIALIZE_DATA',
                        payload: { classes: [], tags: new Map(), currentCalendar: state.currentCalendar, faculty: state.faculty }
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
            // console.timeEnd("loadData");
        };

        loadData();
        // console.timeEnd("CalendarProvider:initialLoad");
        return () => { mounted = false; };
    }, [forceUpdate, session?.user?.email]); // eslint-disable-line react-hooks/exhaustive-deps
    // Depends on session.email rather than session itself because it only changes on login state

    // Detect conflicts whenever a conflict-related property changes on any class
    useEffect(() => {
        if (state.classes.all.length > 0) {
            console.log("DETECTING CONFLICTS");
            const conflicts = detectClassConflicts(state.classes.all);
            dispatch({ type: 'SET_CONFLICTS', payload: conflicts });
            console.log("DETECTED CONFLICTS");
        }
    }, [state.conflictyPropertyChanged]);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        // Faculty
        faculty: state.faculty,

        // Calendar ID
        currentCalendar: state.currentCalendar,

        // Classes
        allClasses: state.classes.all,
        displayClasses: state.classes.all.filter(c => c.visible),
        currentCombinedClass: state.classes.current,

        // Tags
        tagList: state.tags,

        // Conflicts
        conflicts: state.conflicts,

        // Status
        isLoading: state.status.loading,
        error: state.status.error,

        // Actions
        toggleConflictPropertyChanged: () => {
            console.log('CONFLICT_PROPERTY_CHANGED');
            dispatch({
                type: 'TOGGLE_CONFLICT_PROPERTY_CHANGED',
                payload: !state.conflictyPropertyChanged
            })
        },


        updateFaculty: (faculty: FacultyType[], doMerge: boolean): Promise<boolean> => {
            console.log('UPDATE_FACULTY');

            // Merge the new faculty data with existing state
            let mergedFaculty: FacultyType[] = [];

            if (doMerge) {
                // Merge faculty entries if doMerge is true
                mergedFaculty = mergeFacultyEntries(state.faculty, faculty);
            } else {
                // Just use the new faculty data as is
                mergedFaculty = faculty;
            }

            // Return a promise to allow proper async handling
            return new Promise((resolve) => {
                // Update faculty in the database
                updateFaculty(mergedFaculty)
                    .then(() => {
                        console.log("Faculty updated successfully!");
                        dispatch({ type: 'UPDATE_FACULTY', payload: mergedFaculty });
                        resolve(true);
                    })
                    .catch((error) => {
                        console.error("Error updating faculty:", error);
                        resolve(false);
                    });
            });
        },

        resetContextToEmpty: () => {
            console.log('LOGGING OUT, SETTING CONTEXT TO EMPTY');
            dispatch({
                type: 'INITIALIZE_DATA', payload: {
                    classes: [
                        newDefaultEmptyClass()
                    ],
                    tags: new Map(),
                    currentCalendar: newDefaultEmptyCalendar(),
                    faculty: state.faculty
                }
            });
        },

        setCurrentClass: (cls: CombinedClass) => {
            console.log('SET_CURRENT_CLASS');
            dispatch({ type: 'SET_CURRENT_CLASS', payload: cls });
        },

        updateOneClass: async (cls: CombinedClass) => {
            console.log("This is the class: ", cls);
            try {
                console.log('UPDATE_CLASS');

                await updateCombinedClasses([cls], state.currentCalendar._id);

                dispatch({ type: 'UPDATE_CLASS', payload: cls });

                return true;
            } catch (error) {
                console.error("Failed to update class:", error);
                return false;
            }
        },

        updateAllClasses: (classes: CombinedClass[]) => {
            // console.time("updateAllClasses");
            console.log('UPDATE_ALL_CLASSES');
            dispatch({ type: 'UPDATE_ALL_CLASSES', payload: classes });
            // console.timeEnd("updateAllClasses");
        },

        // detectConflicts: () => {
        //     console.log("ALLL CLASSESSSS: ", state.classes.all);
        //     const conflicts = detectClassConflicts(state.classes.all); // Changed this from state.classes.display to state.classes.all
        //     console.log("CONFLICTS: ", conflicts);
        //     dispatch({ type: 'SET_CONFLICTS', payload: conflicts });
        // },

        unlinkTagFromClass: (tagId: string, classId: string) => {
            console.log('UNLINK_TAG_FROM_CLASS');
            dispatch({ type: 'UNLINK_TAG_FROM_CLASS', payload: { tagId, classId } });

            // Find and update the class in the database
            const classToUpdate = state.classes.all.find(c => c._id === classId);
            if (classToUpdate) {
                const updatedClass = {
                    ...classToUpdate,
                    properties: {
                        ...classToUpdate.properties,
                        tags: classToUpdate.properties.tags.filter(t => t.tagName !== tagId)
                    }
                };
                updateCombinedClasses([updatedClass], state.currentCalendar._id);
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
                    properties: {
                        ...classToUpdate.properties,
                        tags: []
                    }
                };
                updateCombinedClasses([updatedClass], state.currentCalendar._id);
            }
        },

        unlinkAllClassesFromTag: (tagId: string) => {
            console.log('UNLINK_ALL_CLASSES_FROM_TAG');
            dispatch({ type: 'UNLINK_ALL_CLASSES_FROM_TAG', payload: tagId });

            // Update all affected classes in the database
            const classIds = state.tags.get(tagId)?.classIds;
            if (classIds) {
                state.classes.all
                    .filter(c => classIds.has(c._id))
                    .forEach(c => {
                        const updatedClass = {
                            ...c,
                            properties: {
                                ...c.properties,
                                tags: c.properties.tags.filter(t => t.tagName !== tagId)
                            }
                        };
                        updateCombinedClasses([updatedClass], state.currentCalendar._id);
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
                    properties: {
                        ...c.properties,
                        tags: []
                    }
                };
                updateCombinedClasses([updatedClass], state.currentCalendar._id);
            });
        },

        uploadNewClasses: (classes: CombinedClass[]) => {
            // console.time("uploadNewClasses");

            // Set loading state immediately
            dispatch({ type: 'SET_LOADING', payload: true });

            // Use bulk update instead of individual updates
            updateCombinedClasses(classes, state.currentCalendar._id).then(() => {
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

                    // Make sure to set loading to false if there's an error
                    dispatch({ type: 'SET_LOADING', payload: false });
                });


            // console.timeEnd("uploadNewClasses");
        },

        deleteClass: async (classId: string) => {
            try {
                const success = await deleteCombinedClasses(classId, state.currentCalendar._id);

                if (!success) {
                    // If API call fails, reload data to restore state
                    console.error("Failed to delete class, reloading data");
                    setForceUpdate(Date.now().toString());
                }

                dispatch({ type: 'DELETE_CLASS', payload: classId });

                return success;
            } catch (error) {
                console.error("Error deleting class:", error);
                // Reload data to restore state
                setForceUpdate(Date.now().toString());
                return false;
            }
        },

        deleteFaculty: (facultyToDeleteEmail: string) => {
            try {
                console.log('DELETE_FACULTY');
                if (facultyToDeleteEmail) {
                    deleteStoredFaculty(facultyToDeleteEmail);
                }

                const updatedFaculty = state.faculty.filter(faculty => faculty.email !== facultyToDeleteEmail);
                dispatch({ type: 'UPDATE_FACULTY', payload: updatedFaculty });

                window.alert(`Faculty ${facultyToDeleteEmail} deleted successfully.`);
                return true;
            } catch (error) {
                console.error("Error deleting faculty:", error);
                return false;
            }
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