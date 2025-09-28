"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback } from "react";
import {
    CalendarAction,
    CalendarContextType,
    CalendarInfo,
    CalendarState,
    CalendarType,
    CombinedClass,
    ConflictType,
    DepartmentType,
    FacultyType,
    ReactNodeChildren,
    tagListType,
} from "@/lib/types";
import {
    updateCombinedClasses,
    loadCalendars,
    loadTags,
    deleteCombinedClasses,
    loadAllFaculty,
    deleteStoredFaculty,
    updateFaculty,
    setCurrentCalendarToNew,
    deleteCohort,
    loadUserSettings,
    loadDepartments,
    insertUser,
    setCurrentDepartmentToNew,
} from "@/lib/DatabaseUtils";
import {
    buildTagMapping,
    createEventsFromCombinedClass,
    initialCalendarState,
    mergeFacultyEntries,
    newDefaultEmptyCalendar,
    newDefaultEmptyClass,
} from "@/lib/common";
import { useSession } from "next-auth/react";
import { EventInput } from "@fullcalendar/core/index.js";
import { useToast } from "../Toast/Toast";

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

/* ------------------------------ helpers ------------------------------ */

const detectClassConflicts = (classes: CombinedClass[]): ConflictType[] => {
    const conflicts: ConflictType[] = [];

    const timeToMinutes = (timeStr: string | undefined): number => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
    };

    for (let i = 0; i < classes.length; i++) {
        const class1 = classes[i];

        if (!class1.properties.days?.length || !class1.properties.start_time || !class1.properties.end_time) {
            continue;
        }

        const class1StartMinutes = timeToMinutes(class1.properties.start_time);
        const class1EndMinutes = timeToMinutes(class1.properties.end_time);

        for (let j = i + 1; j < classes.length; j++) {
            const class2 = classes[j];

            if (!class2.properties.days?.length || !class2.properties.start_time || !class2.properties.end_time) {
                continue;
            }

            const class2StartMinutes = timeToMinutes(class2.properties.start_time);
            const class2EndMinutes = timeToMinutes(class2.properties.end_time);

            const hasTimeOverlap = !(class1EndMinutes <= class2StartMinutes || class2EndMinutes <= class1StartMinutes);

            if (hasTimeOverlap) {
                const dayOverlap = class1.properties.days.some((d1) => class2.properties.days.some((d2) => d1 === d2));

                const sameExactTime =
                    class1.properties.start_time &&
                    class1.properties.end_time &&
                    class2.properties.start_time &&
                    class2.properties.end_time &&
                    class1.properties.start_time === class2.properties.start_time &&
                    class1.properties.end_time === class2.properties.end_time;

                const sameExactName =
                    (class1.data.course_subject &&
                        class1.data.course_num &&
                        class2.data.course_subject &&
                        class2.data.course_num &&
                        class1.data.course_subject === class2.data.course_subject &&
                        class1.data.course_num === class2.data.course_num) ||
                    (class1.data.title && class2.data.title && class1.data.title === class2.data.title);

                const sameInstructor =
                    (class1.properties.instructor_email &&
                        class2.properties.instructor_email &&
                        class1.properties.instructor_email === class2.properties.instructor_email) ||
                    (class1.properties.instructor_name &&
                        class2.properties.instructor_name &&
                        class1.properties.instructor_name === class2.properties.instructor_name);

                if (dayOverlap && !sameExactName) {
                    const roomConflict =
                        class1.properties.room &&
                        class2.properties.room &&
                        class1.properties.room !== "Off Campus" &&
                        class2.properties.room !== "Off Campus" &&
                        class1.properties.room === class2.properties.room;

                    const instructorConflict = !sameExactTime && sameInstructor;

                    const cohortConflict =
                        class1.properties.cohort &&
                        class2.properties.cohort &&
                        class1.properties.cohort === class2.properties.cohort;

                    let conflictType: ConflictType["conflictType"] | null = null;

                    if (roomConflict && instructorConflict && cohortConflict) conflictType = "all";
                    else if (roomConflict && instructorConflict && !cohortConflict) conflictType = "room + instructor";
                    else if (roomConflict && cohortConflict && !instructorConflict) conflictType = "room + cohort";
                    else if (instructorConflict && cohortConflict && !roomConflict) conflictType = "instructor + cohort";
                    else if (roomConflict && !instructorConflict && !cohortConflict) conflictType = "room";
                    else if (instructorConflict && !roomConflict && !cohortConflict) conflictType = "instructor";
                    else if (cohortConflict && !roomConflict && !instructorConflict) conflictType = "cohort";

                    if (conflictType) conflicts.push({ class1, class2, conflictType });
                }
            }
        }
    }

    return conflicts;
};

const getAllSameClasses = (cls: CombinedClass, allClasses: CombinedClass[]): CombinedClass[] => {
    if (!cls || !cls._id || !cls.data.course_subject || !cls.data.course_num) return [];
    return allClasses.filter(
        (c) => c.data.course_subject === cls.data.course_subject && c.data.course_num === cls.data.course_num
    );
};

/* ------------------------------ reducer ------------------------------ */

function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
    switch (action.type) {
        case "INITIALIZE_DATA": {
            const classes = action.payload.classes;
            const tagMapping = buildTagMapping(classes, action.payload.tags);

            return {
                ...state,
                classes: {
                    all: classes,
                    current: state.classes.current,
                    currentClasses: state.classes.currentClasses,
                },
                tags: tagMapping,
                status: { loading: false, error: null },
                user: state.user,
                currentCalendar: action.payload.currentCalendar,
                faculty: action.payload.faculty || state.faculty,
                conflictPropertyChanged: !state.conflictPropertyChanged,
                calendars: action.payload.calendars,
                userSettings: action.payload.userSettings || state.userSettings,
                departments: {
                    all: action.payload.allDepartments ?? state.departments?.all ?? [],
                    current: action.payload.currentDepartment ?? state.departments?.current ?? null,
                },
            };
        }

        case "TOGGLE_CONFLICT_PROPERTY_CHANGED":
            return { ...state, conflictPropertyChanged: action.payload };

        case "UPDATE_FACULTY":
            return { ...state, faculty: action.payload };

        case "SET_CURRENT_CLASS":
            return { ...state, classes: { ...state.classes, current: action.payload } };

        case "SET_CURRENT_CLASSES":
            return { ...state, classes: { ...state.classes, currentClasses: action.payload } };

        case "SET_NEW_CALENDAR":
            return {
                ...state,
                currentCalendar: { _id: action.payload.calendarId, info: {} as CalendarInfo, classes: [] } as CalendarType,
                classes: { all: [], current: newDefaultEmptyClass(), currentClasses: [] },
                tags: new Map() as tagListType,
                status: { loading: false, error: null },
                faculty: [],
                conflictPropertyChanged: !state.conflictPropertyChanged,
                conflicts: [] as ConflictType[],
            };

        case "UPDATE_CLASS": {
            const updatedClass = action.payload;
            const updateClassById = (classes: CombinedClass[]) => classes.map((c) => (c._id === updatedClass._id ? updatedClass : c));
            return {
                ...state,
                classes: {
                    all: updateClassById(state.classes.all),
                    current: updatedClass,
                    currentClasses: getAllSameClasses(updatedClass, updateClassById(state.classes.all)),
                },
            };
        }

        case "UPDATE_ALL_CLASSES": {
            const classes = action.payload;
            const tagMapping = buildTagMapping(classes, state.tags);
            return {
                ...state,
                classes: { all: classes, current: state.classes.current, currentClasses: state.classes.currentClasses },
                tags: tagMapping,
            };
        }

        case "SET_CONFLICTS":
            return { ...state, conflicts: action.payload };

        case "SET_LOADING":
            return { ...state, status: { ...state.status, loading: action.payload } };

        case "SET_ERROR":
            return { ...state, status: { ...state.status, error: action.payload } };

        case "UNLINK_TAG_FROM_CLASS": {
            const { tagId, classId } = action.payload;
            const newMapping = new Map(state.tags);
            const tagCategoryAndClassIds = newMapping.get(tagId);

            if (tagCategoryAndClassIds) {
                tagCategoryAndClassIds.classIds.delete(classId);
                if (tagCategoryAndClassIds.classIds.size === 0) newMapping.delete(tagId);
                else newMapping.set(tagId, tagCategoryAndClassIds);
            }

            const updatedClasses = state.classes.all.map((c) =>
                c._id === classId
                    ? { ...c, properties: { ...c.properties, tags: c.properties.tags.filter((t) => t.tagName !== tagId) } }
                    : c
            );

            return {
                ...state,
                classes: {
                    all: updatedClasses,
                    current: state.classes.current?._id === classId ? updatedClasses.find((c) => c._id === classId) : state.classes.current,
                    currentClasses: state.classes.currentClasses,
                },
                tags: newMapping,
            };
        }

        case "UNLINK_ALL_TAGS_FROM_CLASS": {
            const classId = action.payload;
            const updatedClasses = state.classes.all.map((c) =>
                c._id === classId ? { ...c, properties: { ...c.properties, tags: [] } } : c
            );

            const newMapping = new Map(state.tags);
            for (const [tagId, tagCategoryAndClassIds] of newMapping.entries()) {
                tagCategoryAndClassIds.classIds.delete(classId);
                if (tagCategoryAndClassIds.classIds.size === 0) newMapping.delete(tagId);
            }

            return {
                ...state,
                classes: {
                    all: updatedClasses,
                    current:
                        state.classes.current?._id === classId
                            ? updatedClasses.find((c) => c._id === classId)
                            : state.classes.current,
                    currentClasses: state.classes.currentClasses,
                },
                tags: newMapping,
            };
        }

        case "UNLINK_ALL_CLASSES_FROM_TAG": {
            const tagId = action.payload;
            const classIds = state.tags.get(tagId)?.classIds;
            const affectedClassIds = classIds ? Array.from(classIds) : [];

            const updatedClasses = state.classes.all.map((c) =>
                affectedClassIds.includes(c._id)
                    ? { ...c, properties: { ...c.properties, tags: c.properties.tags.filter((t) => t.tagName !== tagId) } }
                    : c
            );

            const newMapping = new Map(state.tags);
            newMapping.delete(tagId);

            return {
                ...state,
                classes: {
                    all: updatedClasses,
                    current:
                        state.classes.current && affectedClassIds.includes(state.classes.current._id)
                            ? updatedClasses.find((c) => c._id === state.classes.current?._id)
                            : state.classes.current,
                    currentClasses: state.classes.currentClasses,
                },
                tags: newMapping,
            };
        }

        case "UNLINK_ALL_TAGS_FROM_ALL_CLASSES": {
            const updatedClasses = state.classes.all.map((c) => ({
                ...c,
                properties: { ...c.properties, tags: [] },
            }));

            return {
                ...state,
                classes: {
                    all: updatedClasses,
                    current: state.classes.current
                        ? { ...state.classes.current, properties: { ...state.classes.current.properties, tags: [] } }
                        : undefined,
                    currentClasses: state.classes.currentClasses,
                },
                tags: new Map(),
            };
        }

        case "UPLOAD_CLASSES": {
            const newClasses = [...state.classes.all, ...action.payload];
            const newMapping = buildTagMapping(newClasses);
            return {
                ...state,
                classes: { all: newClasses, current: state.classes.current, currentClasses: state.classes.currentClasses },
                tags: newMapping,
                conflictPropertyChanged: !state.conflictPropertyChanged,
            };
        }

        case "DELETE_CLASS": {
            const classIdToDelete = action.payload;
            const filteredAllClasses = state.classes.all.filter((c) => c._id !== classIdToDelete);

            const newMapping = new Map(state.tags);
            for (const [tagName, tagCategoryAndclassIds] of newMapping.entries()) {
                let modified = false;
                const classIds = tagCategoryAndclassIds.classIds;
                if (classIds.has(classIdToDelete)) {
                    classIds.delete(classIdToDelete);
                    modified = true;
                }
                if (modified && classIds.size === 0) newMapping.delete(tagName);
            }

            const newCurrentClass =
                state.classes.current && classIdToDelete === state.classes.current._id ? undefined : state.classes.current;

            return {
                ...state,
                classes: {
                    all: filteredAllClasses,
                    current: newCurrentClass,
                    currentClasses: state.classes.currentClasses.filter((c) => c._id !== classIdToDelete),
                },
                tags: newMapping,
                conflictPropertyChanged: !state.conflictPropertyChanged,
            };
        }

        case "SET_CURRENT_DEPARTMENT":
            return { ...state, departments: { all: state.departments.all, current: action.payload } };

        default:
            return state;
    }
}

/* ------------------------------ provider ------------------------------ */

export const CalendarProvider = ({ children }: ReactNodeChildren) => {
    const [state, dispatch] = useReducer(calendarReducer, initialCalendarState);
    const [forceUpdate, setForceUpdate] = useState("");
    const { data: session } = useSession();
    const { toast } = useToast();

    // ensure user in DB
    useEffect(() => {
        async function ensureUserExists() {
            if (!session?.user?.email) return;
            const { success, status } = await insertUser();
            if (!success) {
                console.error("Failed to ensure user exists.");
            } else if (!status || status !== 409) {
                toast({ description: "Welcome " + (session.user.name || session.user.email) + "!", variant: "success" });
            }
        }
        ensureUserExists();
    }, [session?.user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

    // load initial data
    useEffect(() => {
        let mounted = true;
        const loadData = async () => {
            try {
                dispatch({ type: "SET_LOADING", payload: true });

                if (session?.user?.email) {
                    const [calendarPayload, allTags, faculty, userSettings, departments] = await Promise.all([
                        loadCalendars(),
                        loadTags(),
                        loadAllFaculty(),
                        loadUserSettings(),
                        loadDepartments(),
                    ]);

                    const calendar = calendarPayload.calendar;
                    const classes = calendar.classes;
                    calendar.classes = [];

                    if (mounted) {
                        dispatch({
                            type: "INITIALIZE_DATA",
                            payload: {
                                classes,
                                tags: allTags,
                                currentCalendar: calendar,
                                calendars: calendarPayload.calendars,
                                faculty,
                                userSettings,
                                allDepartments: departments.all,
                                currentDepartment: departments.current,
                            },
                        });
                    }
                } else {
                    dispatch({
                        type: "INITIALIZE_DATA",
                        payload: {
                            classes: [],
                            tags: new Map(),
                            currentCalendar: state.currentCalendar,
                            calendars: state.calendars,
                            faculty: state.faculty,
                            userSettings: state.userSettings,
                            allDepartments: [],
                            currentDepartment: null,
                        },
                    });
                }
            } catch (err) {
                if (mounted) {
                    console.error("Error loading data:", err);
                    dispatch({
                        type: "SET_ERROR",
                        payload: err instanceof Error ? err.message : "Failed to load data",
                    });
                    dispatch({ type: "SET_LOADING", payload: false });
                }
            }
        };

        loadData();
        return () => {
            mounted = false;
        };
    }, [forceUpdate, session?.user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

    // conflict detection (explicit toggle)
    useEffect(() => {
        if (state.classes.all.length > 0) {
            const conflicts = detectClassConflicts(state.classes.all);
            dispatch({ type: "SET_CONFLICTS", payload: conflicts });
        }
    }, [state.conflictPropertyChanged]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ---------------------- memoized selectors/helpers ---------------------- */

    // current department course membership, normalized
    const departmentHasCourse = useCallback(
        (course_subject?: string, course_num?: string): boolean => {
            const dept = state.departments.current;
            if (!dept?.class_list) return false;

            const s = String(course_subject ?? "").trim().toLowerCase();
            const n = String(course_num ?? "").trim();

            return dept.class_list.some(
                (c) =>
                    String(c.course_subject ?? "").trim().toLowerCase() === s &&
                    String(c.course_num ?? "").trim() === n
            );
        },
        [state.departments.current]
    );

    const departmentHasClass = useCallback(
        (cls: CombinedClass): boolean =>
            departmentHasCourse(cls?.data?.course_subject, cls?.data?.course_num),
        [departmentHasCourse]
    );

    const classById = useCallback(
        (id?: string) => (id ? state.classes.all.find((c) => c._id === id) : undefined),
        [state.classes.all]
    );

    // visible classes (stable identity until classes change)
    const displayClasses = useMemo(() => {
        const arr = state.classes.all.filter((c) => c.visible);
        arr.sort((a, b) => {
            if (a.data.course_subject < b.data.course_subject) return -1;
            if (a.data.course_subject > b.data.course_subject) return 1;
            if (a.data.course_num < b.data.course_num) return -1;
            if (a.data.course_num > b.data.course_num) return 1;
            if (a.data.section < b.data.section) return -1;
            if (a.data.section > b.data.section) return 1;
            return 0;
        });
        return arr;
    }, [state.classes.all]);

    // events derived from displayClasses + department gate
    const displayEvents = useMemo(() => {
        const events: EventInput[] = [];

        for (const cls of displayClasses) {
            if (!cls._id) continue;

            const evts = createEventsFromCombinedClass(cls, departmentHasClass(cls));

            // embed reference for fast lookup in Calendar
            evts.forEach((e) => {
                if (!e.extendedProps) e.extendedProps = {};
                e.extendedProps.combinedClass = cls;
            });

            // store on class (your code relies on this in places)
            cls.events = evts;

            events.push(...evts);
        }

        return events;
    }, [displayClasses, departmentHasClass]);

    // edit flags
    const currentEditable = useMemo(() => {
        return !!state.classes.current && departmentHasClass(state.classes.current);
    }, [state.classes.current, departmentHasClass]);

    const canEditClass = useCallback(
        (cls?: CombinedClass) => {
            const c = cls ?? state.classes.current;
            if (!c) return false;
            return departmentHasCourse(c.data.course_subject, c.data.course_num);
        },
        [state.classes.current, departmentHasCourse]
    );

    /* -------------------------- actions (inline) -------------------------- */
    // (We keep these inline. They’ll change identity with relevant state; that’s OK.)

    const contextValue = useMemo<CalendarContextType>(() => {
        return {
            /* Department */
            currentDepartment: state.departments?.current ? state.departments.current : null,
            allDepartments: state.departments?.all ? state.departments.all : [],
            setCurrentDepartment: (newDepartment: DepartmentType) => {
                if (!newDepartment || !newDepartment._id) {
                    console.error("Invalid department:", newDepartment);
                    return;
                }
                setCurrentDepartmentToNew(newDepartment._id)
                    .then(() => {
                        dispatch({ type: "SET_CURRENT_DEPARTMENT", payload: newDepartment });
                    })
                    .catch((error) => {
                        console.error("Error setting current department:", error);
                    })
                    .finally(() => {
                        setForceUpdate(Date.now().toString());
                    });
            },

            /* Faculty */
            faculty: state.faculty,

            /* Calendar meta */
            currentCalendar: state.currentCalendar,
            calendarInfoList: state.calendars,

            /* Classes & Events (memoized above) */
            allClasses: state.classes.all,
            displayClasses,
            displayEvents,
            currentCombinedClass: state.classes.current,
            currentCombinedClasses: state.classes.currentClasses,

            /* Ownership helpers (exported) */
            departmentHasClass,
            departmentHasCourse,
            classById,

            /* Edit helpers */
            currentEditable,
            canEditClass,

            /* Tags */
            tagList: state.tags,

            /* Conflicts */
            conflicts: state.conflicts,
            conflictPropertyChanged: state.conflictPropertyChanged,

            /* Status */
            isLoading: state.status.loading,
            error: state.status.error,

            /* User Settings */
            userSettings: state.userSettings,

            /* Actions */
            toggleConflictPropertyChanged: () => {
                dispatch({ type: "TOGGLE_CONFLICT_PROPERTY_CHANGED", payload: !state.conflictPropertyChanged });
            },

            updateFaculty: (faculty: FacultyType[], doMerge: boolean): Promise<boolean> => {
                let mergedFaculty: FacultyType[] = doMerge ? mergeFacultyEntries(state.faculty, faculty) : faculty;

                return new Promise((resolve) => {
                    updateFaculty(mergedFaculty)
                        .then(() => {
                            dispatch({ type: "UPDATE_FACULTY", payload: mergedFaculty });
                            resolve(true);
                        })
                        .catch((error) => {
                            console.error("Error updating faculty:", error);
                            resolve(false);
                        });
                });
            },

            resetContextToEmpty: () => {
                dispatch({
                    type: "INITIALIZE_DATA",
                    payload: {
                        classes: [newDefaultEmptyClass()],
                        tags: new Map(),
                        currentCalendar: newDefaultEmptyCalendar(),
                        calendars: [],
                        faculty: [],
                        userSettings: state.userSettings,
                        allDepartments: [],
                        currentDepartment: null,
                    },
                });
            },

            setContextToOtherCalendar: async (calendarId: string) => {
                if (!session?.user?.email) {
                    console.error("No user email found in session");
                    return;
                }
                await setCurrentCalendarToNew(calendarId);
                dispatch({ type: "SET_NEW_CALENDAR", payload: { userEmail: session.user.email, calendarId } });
                setForceUpdate(Date.now().toString());
            },

            setCurrentClass: (cls: CombinedClass) => {
                dispatch({ type: "SET_CURRENT_CLASS", payload: cls });
            },

            setCurrentClasses: (cls: CombinedClass) => {
                dispatch({ type: "SET_CURRENT_CLASSES", payload: getAllSameClasses(cls, state.classes.all) });
            },

            updateOneClass: async (cls: CombinedClass) => {
                try {
                    await updateCombinedClasses([cls], state.currentCalendar._id);
                    dispatch({ type: "UPDATE_CLASS", payload: cls });
                    return true;
                } catch (error) {
                    console.error("Failed to update class:", error);
                    return false;
                }
            },

            updateAllClasses: (classes: CombinedClass[]) => {
                dispatch({ type: "UPDATE_ALL_CLASSES", payload: classes });
            },

            unlinkTagFromClass: (tagId: string, classId: string) => {
                dispatch({ type: "UNLINK_TAG_FROM_CLASS", payload: { tagId, classId } });
                const classToUpdate = state.classes.all.find((c) => c._id === classId);
                if (classToUpdate) {
                    const updatedClass = {
                        ...classToUpdate,
                        properties: { ...classToUpdate.properties, tags: classToUpdate.properties.tags.filter((t) => t.tagName !== tagId) },
                    };
                    updateCombinedClasses([updatedClass], state.currentCalendar._id);
                }
            },

            unlinkAllTagsFromClass: (classId: string) => {
                dispatch({ type: "UNLINK_ALL_TAGS_FROM_CLASS", payload: classId });
                const classToUpdate = state.classes.all.find((c) => c._id === classId);
                if (classToUpdate) {
                    const updatedClass = { ...classToUpdate, properties: { ...classToUpdate.properties, tags: [] } };
                    updateCombinedClasses([updatedClass], state.currentCalendar._id);
                }
            },

            unlinkAllClassesFromTag: (tagId: string) => {
                dispatch({ type: "UNLINK_ALL_CLASSES_FROM_TAG", payload: tagId });

                const classIds = state.tags.get(tagId)?.classIds;
                if (classIds) {
                    state.classes.all
                        .filter((c) => classIds.has(c._id))
                        .forEach((c) => {
                            const updatedClass = {
                                ...c,
                                properties: { ...c.properties, tags: c.properties.tags.filter((t) => t.tagName !== tagId) },
                            };
                            updateCombinedClasses([updatedClass], state.currentCalendar._id);
                        });
                }
            },

            unlinkAllTagsFromAllClasses: () => {
                dispatch({ type: "UNLINK_ALL_TAGS_FROM_ALL_CLASSES" });
                state.classes.all.forEach((c) => {
                    const updatedClass = { ...c, properties: { ...c.properties, tags: [] } };
                    updateCombinedClasses([updatedClass], state.currentCalendar._id);
                });
            },

            uploadNewClasses: (classes: CombinedClass[]) => {
                dispatch({ type: "SET_LOADING", payload: true });
                updateCombinedClasses(classes, state.currentCalendar._id)
                    .then(() => {
                        dispatch({ type: "UPLOAD_CLASSES", payload: classes });
                        setForceUpdate(Date.now().toString());
                    })
                    .catch((error) => {
                        console.error("Error uploading classes:", error);
                        dispatch({ type: "SET_ERROR", payload: "Failed to upload classes. Please try again." });
                        dispatch({ type: "SET_LOADING", payload: false });
                    });
            },

            deleteClass: async (classId: string) => {
                try {
                    if (!state.currentCalendar._id) return;
                    const success = await deleteCombinedClasses(classId, state.currentCalendar._id);
                    if (!success) {
                        console.error("Failed to delete class, reloading data");
                        setForceUpdate(Date.now().toString());
                    }
                    dispatch({ type: "DELETE_CLASS", payload: classId });
                    return success;
                } catch (error) {
                    console.error("Error deleting class:", error);
                    setForceUpdate(Date.now().toString());
                    return false;
                }
            },

            deleteFaculty: (facultyToDeleteEmail: string) => {
                try {
                    if (facultyToDeleteEmail) deleteStoredFaculty(facultyToDeleteEmail);
                    const updatedFaculty = state.faculty.filter((f) => f.email !== facultyToDeleteEmail);
                    dispatch({ type: "UPDATE_FACULTY", payload: updatedFaculty });
                    toast({ description: `Faculty ${facultyToDeleteEmail} deleted successfully.`, variant: "success" });
                    return true;
                } catch (error) {
                    console.error("Error deleting faculty:", error);
                    return false;
                }
            },

            removeCohort: async (cohortId: string, departmentId: string) => {
                try {
                    const success = await deleteCohort(cohortId, departmentId);
                    if (!success) console.error("Failed to delete cohort");
                    setForceUpdate(Date.now().toString());
                    return success;
                } catch (error) {
                    console.error("Error deleting cohort:", error);
                    return false;
                }
            },
        };
    }, [
        /* selectors / helpers */
        displayClasses,
        displayEvents,
        departmentHasClass,
        departmentHasCourse,
        classById,
        currentEditable,
        canEditClass,

        /* primitives used directly in the object */
        state.status.loading,
        state.status.error,
        state.currentCalendar,
        state.faculty,
        state.tags,
        state.conflicts,
        state.conflictPropertyChanged,
        state.userSettings,
        state.calendars,
        state.departments.current,
        state.departments.all,

        /* functions that close over state */
        session?.user?.email,
    ]);

    if (typeof window !== "undefined") {
        (window as any).__calendarContext__ = contextValue; // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    return <CalendarContext.Provider value={contextValue}>{children}</CalendarContext.Provider>;
};

export const useCalendarContext = () => {
    const context = useContext(CalendarContext);
    if (context === undefined) throw new Error("useCalendarContext must be used within a CalendarProvider");
    return context;
};
