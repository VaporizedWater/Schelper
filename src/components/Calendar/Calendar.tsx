"use client";

import FullCalendar from "@fullcalendar/react";
import interactionPlugin, { DateClickArg, EventResizeStopArg } from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

import { BusinessHoursInput, EventClickArg, EventDropArg, EventInput, EventMountArg } from "@fullcalendar/core";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { dayIndex, defaultBackgroundColor, defaultSettings, newDefaultEmptyClass, selectedBackgroundColor, ShortenedDays, viewFiveDays } from "@/lib/common";
import { CombinedClass } from "@/lib/types";
import { useTheme } from "next-themes";
import Link from "next/link";

const selectedEvents: HTMLElement[] = [];

const Calendar = () => {
    const { theme, resolvedTheme } = useTheme();
    const calendarRef = useRef<FullCalendar>(null);
    const { faculty, allClasses, displayClasses, displayEvents, currentCombinedClass, conflicts, isLoading, setCurrentClass, setCurrentClasses, updateOneClass, toggleConflictPropertyChanged, userSettings, currentCalendar } = useCalendarContext();
    // const [events, setEvents] = useState<EventInput[]>([]);
    const [businessHours, setBusinessHours] = useState<BusinessHoursInput>([] as EventInput[]);

    // Enhanced findClass that uses our eventMap for better performance
    const findClass = useCallback((info: EventClickArg | EventDropArg | EventResizeStopArg) => {
        // Get the class directly from the event's extendedProps
        if (info.event.extendedProps?.combinedClass) {
            return info.event.extendedProps.combinedClass as CombinedClass;
        }

        // Fallback to lookup by ID if class reference is not available
        const classId = info.event.extendedProps.combinedClassId;
        return displayClasses.find(cls => cls._id === classId);
    }, [displayClasses]);

    const unselectAll = useCallback(() => {
        selectedEvents.forEach(element => {
            if (element) {
                element.style.backgroundColor = defaultBackgroundColor;
                element.style.outlineColor = defaultBackgroundColor;
                if (element.parentElement) {
                    element.parentElement.style.zIndex = '1';
                }
            }
        });

        selectedEvents.length = 0;
    }, [theme, resolvedTheme]); // eslint-disable-line react-hooks/exhaustive-deps

    const selectEvent = useCallback((element: HTMLElement) => {
        const isDarkMode = theme === 'dark' || resolvedTheme === 'dark';
        const bgColor = isDarkMode ? 'lightgray' : selectedBackgroundColor;

        element.style.backgroundColor = bgColor;
        element.style.outlineColor = bgColor;
        const parent = element.parentElement;

        if (parent) {
            parent.style.zIndex = '9999';
        }
        selectedEvents.push(element);
    }, [theme, resolvedTheme]);

    // Update events for a single class (much more efficient)
    // const updateEventsForClass = useCallback((updatedClass: CombinedClass) => {
    //     if (!updatedClass._id) return;

    //     const newClassEvents = createEventsFromCombinedClass(updatedClass);

    //     // Add class reference to each event's extendedProps
    //     newClassEvents.forEach(event => {
    //         if (!event.extendedProps) event.extendedProps = {};
    //         event.extendedProps.combinedClass = updatedClass; // Store the actual class reference
    //     });

    //     // // Update the events array by replacing only events for this class
    //     setEvents(prev => {
    //         const filteredEvents = prev.filter(
    //             event => event.extendedProps?.combinedClassId !== updatedClass._id
    //         );
    //         return [...filteredEvents, ...newClassEvents];
    //     });
    // }, [createEventsFromCombinedClass]);

    const handleEventClick = useCallback((info: EventClickArg) => {
        unselectAll();
        // selectEvent(info.el);

        console.log("Event clicked: ", info);

        const foundClass = findClass(info);

        if (foundClass) {
            console.log("Found class: ", foundClass);
            const elements = document.getElementsByClassName(`event-${foundClass?._id}`);
            for (let i = 0; i < elements.length; i++) {
                selectEvent(elements[i] as HTMLElement);
            }

            setCurrentClass(foundClass);
            setCurrentClasses(foundClass);
            // console.log("Current class: ", foundClass);

            // Use the instructor's email to find the matching Faculty record
            const instructorEmail = foundClass.properties.instructor_email;
            const matchedFaculty = faculty.find(faculty => faculty.email === instructorEmail);

            if (matchedFaculty) {
                console.log("Matched Faculty: ", matchedFaculty);

                const fullDayStart = "08:00";
                const fullDayEnd = "21:00";
                const newBusinessHours: BusinessHoursInput = [] as EventInput[];

                // Iterate through the unavailability slots and create available time slots
                Object.entries(matchedFaculty.unavailability).forEach(([dayKey, slots]) => {
                    // Normalize and sort the blocks by start time
                    const blocks = slots
                        .map(s => ({ start: s.start, end: s.end }))
                        .sort((a, b) => String(a.start).localeCompare(String(b.start)));


                    // Deal with first block from 8:00 to the first unavailability
                    if (blocks.length === 0 || blocks[0].start && blocks[0].start > fullDayStart) {
                        newBusinessHours.push({
                            daysOfWeek: [dayIndex[dayKey]],
                            startTime: fullDayStart,
                            endTime: blocks[0]?.start ?? fullDayEnd
                        });
                    }

                    // Deal with middle blocks
                    for (let i = 0; i < blocks.length - 1; i++) {
                        const endPrev = blocks[i].end;
                        const startNext = blocks[i + 1].start;
                        if (startNext && endPrev && startNext > endPrev) {
                            newBusinessHours.push({
                                daysOfWeek: [dayIndex[dayKey]],
                                startTime: endPrev,
                                endTime: startNext
                            });
                        }
                    }

                    // Deal with last block from the last unavailability to 21:00
                    const lastEnd = blocks[blocks.length - 1]?.end;
                    if (lastEnd && lastEnd < fullDayEnd) {
                        newBusinessHours.push({
                            daysOfWeek: [dayIndex[dayKey]],
                            startTime: lastEnd,
                            endTime: fullDayEnd
                        });
                    }
                });

                setBusinessHours(newBusinessHours);
            } else {
                // If no matching record is found, clear all
                setBusinessHours([]);
            }
        } else {
            console.log("Class not found");
        }
    }, [faculty, findClass, selectEvent, setCurrentClass, setCurrentClasses, unselectAll]);

    // This triggers when clicking on any date/time slot that isn't an event
    const handleDateClick = useCallback((info: DateClickArg) => {
        console.log("Date clicked: ", info);
        unselectAll();
        if (currentCombinedClass) {
            setCurrentClass(newDefaultEmptyClass());
            setCurrentClasses(newDefaultEmptyClass());
        }
        setBusinessHours([]);
    }, [unselectAll, setCurrentClass, setCurrentClasses, setBusinessHours]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleEventDrop = useCallback((info: EventDropArg) => {
        // Update the class in the context
        const foundClass = findClass(info);

        if (foundClass) {
            // Get the new start and end times and the day if changed
            const newStart = info.event.start?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            const newEnd = info.event.end?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            const newDay = ShortenedDays[(info.event.start?.getDay() ?? 1) - 1];

            if (!newStart || !newEnd || !newDay) {
                info.revert();
                return;
            }

            const multiDays = foundClass.properties.days.length > 1;

            // Update class properties
            const updatedClass = {
                ...foundClass,
                properties: {
                    ...foundClass.properties,
                    start_time: newStart,
                    end_time: newEnd,
                    // Only modify days if it's a single day event
                    days: multiDays ? foundClass.properties.days : [newDay]
                }
            };

            // updateEventsForClass(updatedClass);

            // Then update in context/database
            toggleConflictPropertyChanged();
            updateOneClass(updatedClass);
        }
    }, [findClass, toggleConflictPropertyChanged, updateOneClass]);

    const handleEventResize = useCallback((info: EventResizeStopArg) => {
        const foundClass = findClass(info);

        if (foundClass) {
            const newEnd = info.event.end?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

            if (!newEnd) {
                return;
            }

            // Update class properties
            const updatedClass = {
                ...foundClass,
                properties: {
                    ...foundClass.properties,
                    end_time: newEnd
                }
            };

            // updateEventsForClass(updatedClass);

            // Then update in context/database
            updateOneClass(updatedClass);
            toggleConflictPropertyChanged();
        }
    }, [findClass, toggleConflictPropertyChanged, updateOneClass]);

    // Memoize the event content renderer
    const eventContent = useCallback((eventInfo: EventInput) => {
        const classId = eventInfo.event.extendedProps.combinedClassId;

        // Find conflicts involving this class
        const classConflicts = conflicts.filter(conflict =>
            conflict.class1._id === classId ||
            conflict.class2._id === classId
        );

        // Default color if no conflict
        let backgroundColor = '#3788d8';

        if (classConflicts.length > 0) {
            // Determine most severe conflict type (all > room + instructor > room + cohort > instructor + cohort > room > instructor > cohort)
            const hasAllConflict = classConflicts.some(c => c.conflictType === "all");
            const hasRoomInstructorConflict = classConflicts.some(c => c.conflictType === "room + instructor");
            const hasRoomCohortConflict = classConflicts.some(c => c.conflictType === "room + cohort");
            const hasInstructorCohortConflict = classConflicts.some(c => c.conflictType === "instructor + cohort");
            const hasRoomConflict = classConflicts.some(c => c.conflictType === "room");
            const hasInstructorConflict = classConflicts.some(c => c.conflictType === "instructor");
            const hasCohortConflict = classConflicts.some(c => c.conflictType === "cohort");

            const conflictColors = userSettings?.settings?.conflicts || defaultSettings.settings.conflicts;

            if (hasAllConflict) {
                backgroundColor = conflictColors.all; // Room + Instructor + Cohort conflict
            } else if (hasRoomInstructorConflict) {
                backgroundColor = conflictColors.roomInstructor; // Orange for room + instructor or room + cohort or instructor + cohort conflicts
            } else if (hasRoomCohortConflict) {
                backgroundColor = conflictColors.roomCohort; // Amber for room or instructor or cohort conflicts
            } else if (hasInstructorCohortConflict) {
                backgroundColor = conflictColors.instructorCohort; // Orange for room + instructor or room + cohort or instructor + cohort conflicts
            } else if (hasRoomConflict) {
                backgroundColor = conflictColors.room; // Amber for room or instructor or cohort conflicts
            } else if (hasInstructorConflict) {
                backgroundColor = conflictColors.instructor; // Orange for room + instructor or room + cohort or instructor + cohort conflicts
            } else if (hasCohortConflict) {
                backgroundColor = conflictColors.cohort; // Amber for room or instructor or cohort conflicts
            }
        }

        // Get the section from the extendedProps
        const section = eventInfo.event.extendedProps.combinedClass?.data?.section || '';

        return {
            html: `<div 
                    style="
                        background-color: ${backgroundColor}; 
                        color: white;
                        padding: 2px 2px;
                        border-radius: 1px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        font-size: 0.875rem; /* Medium font size for events */"
                    title="${eventInfo.event.title}${section ? ` - §${section}` : ''}"
                >
                    ${eventInfo.event.title}${section ? ` - §${section}` : ''}
                </div>`
        };
    }, [conflicts]); // eslint-disable-line react-hooks/exhaustive-deps

    // EventInfo in types defines possibilities, but fullcalendar doesn't support typescript, so dont use it as the type here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventClassNames = useCallback((eventInfo: any) => {
        return `event-${eventInfo.event.extendedProps?.combinedClassId}`;
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventMounted = useCallback((eventInfo: EventMountArg) => {
        const _id = eventInfo.event.extendedProps.combinedClassId;
        if (currentCombinedClass) {
            if (_id === currentCombinedClass._id) {
                selectEvent(eventInfo.el);

                if (currentCombinedClass) {
                    const props = currentCombinedClass.properties;
                    const text = `<p style="font-size: 0.875rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${props.start_time}-${props.end_time}</p>`;
                    const parent = eventInfo.el.parentElement as HTMLElement;
                    const column = parent?.parentElement as HTMLElement;

                    if (parent && column) {
                        const element = parent.getElementsByClassName("fc-event-main")[0];
                        element.innerHTML += text; // Add time

                        // Expand event to column width
                        parent.style.setProperty("width", `${column.clientWidth}px`, "important");
                        parent.style.setProperty("left", "0%", "important");
                    }
                }
            }
        }
    }, [currentCombinedClass, selectEvent]);

    // Update selected events when currentCombinedClass changes
    useEffect(() => {
        if (currentCombinedClass?._id) {
            unselectAll();
            const elements = document.getElementsByClassName(`event-${currentCombinedClass._id}`);
            for (let i = 0; i < elements.length; i++) {
                selectEvent(elements[i] as HTMLElement);
            }
        } else {
            unselectAll();
        }
    }, [currentCombinedClass, selectEvent, unselectAll]);

    const fullcalendarComponent = useMemo(() => {
        if (displayEvents.length === 0) {
            return (<FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, interactionPlugin]}
                editable
                expandRows
                selectable={false}
                events={displayEvents}
                slotDuration={'00:30:00'}
                slotMinTime={'08:00:00'}
                slotMaxTime={'21:00:00'} // Changed from 21:00:00 to add buffer space
                snapDuration={'00:05:00'}
                eventClick={handleEventClick}
                allDaySlot={false}
                initialView='viewFiveDays'
                views={viewFiveDays}
                headerToolbar={false}
                height={'100%'}
                dayHeaderFormat={{ 'weekday': 'long' }}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                dateClick={handleDateClick}
                eventContent={eventContent}
                eventClassNames={eventClassNames}
                eventDidMount={eventMounted}
                handleWindowResize={true}
                windowResizeDelay={0}
            />);
        }
        return (<FullCalendar
            ref={calendarRef}
            plugins={[timeGridPlugin, interactionPlugin]}
            editable
            expandRows
            selectable={false}
            events={displayEvents}
            slotDuration={'00:30:00'}
            slotMinTime={'08:00:00'}
            slotMaxTime={'21:00:00'} // Changed from 21:00:00 to add buffer space
            snapDuration={'00:05:00'}
            eventClick={handleEventClick}
            allDaySlot={false}
            initialView='viewFiveDays'
            views={viewFiveDays}
            headerToolbar={false}
            height={'100%'}
            dayHeaderFormat={{ 'weekday': 'long' }}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            dateClick={handleDateClick}
            eventContent={eventContent}
            eventClassNames={eventClassNames}
            eventDidMount={eventMounted}
            businessHours={businessHours}
            eventBackgroundColor="#242424"
            handleWindowResize={true}
            windowResizeDelay={0}
        />);

    }, [businessHours, allClasses]); // eslint-disable-line react-hooks/exhaustive-deps

    if (isLoading) {
        return (
            <div
                id="classes-loading-overlay"
                role="status"
                aria-live="polite"
                aria-label="Loading classes"
                className="h-full flex items-center justify-center bg-white dark:bg-dark bg-opacity-80 dark:bg-opacity-100"
            >
                <div className="text-center">
                    <div
                        id="classes-loading-spinner"
                        role="status"
                        aria-busy="true"
                        aria-describedby="classes-loading-text"
                        title="Loading classes"
                        className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"
                    />
                    <p
                        id="classes-loading-text"
                        className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-400"
                    >
                        Loading classes...
                    </p>
                </div>
            </div>
        );
    }

    if (!currentCalendar || currentCalendar._id === '') {
        return (
            <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Please select or <Link href={"/createCalendar"} className="text-blue-500">create a calendar</Link> to view classes.</p>
            </div>
        )
    }

    return (
        <div className="h-full text-sm pb-2">
            {fullcalendarComponent}

            {/* Add custom CSS for calendar font sizes */}
            <style jsx global>{`
  /* Keep time slots and headers small */
  .fc .fc-timegrid-slot-label,
  .fc .fc-col-header-cell {
    font-size: 0.875rem; /* text-sm */
  }
  
  /* Make event content medium sized */
  .fc-event-main {
    font-size: 1rem !important; /* text-md */
  }

  /* non‑business slots get a lighter tint */
  .fc .fc-non-business {
    background-color: rgba(250, 0, 0, 0.2) !important;
  }

  .dark .fc .fc-non-business {
    background-color: rgba(255, 130, 130, 0.4) !important;
  }

  
  
  /* Add dark gray borders for dark mode */
  .dark .fc-theme-standard .fc-scrollgrid,
  .dark .fc-theme-standard td,
  .dark .fc-theme-standard th {
    border-color: #4b5563 !important; /* gray-500 */
  }

  .dark .fc-timegrid-slot,
  .dark .fc-timegrid-axis,
  .dark .fc-col-header-cell {
    border-color: #4b5563 !important; /* gray-500 */
  }

  .dark .fc-scrollgrid-section,
  .dark .fc-scrollgrid-section table {
    border-color: #4b5563 !important; /* gray-500 */
  }

  .dark .fc .fc-timegrid-divider {
    background-color: #4b5563 !important; /* gray-500 */
  }
  
  /* Event borders in dark mode */
  .dark .fc-event,
  .dark .fc-event-main,
  .dark .fc-h-event,
  .dark .fc-v-event {
    border-color: #343636 !important; /* gray-500 */
  }
  
  /* Selected event border/highlight color */
  .dark .fc-event.selected,
  .dark .fc-event:focus {
    outline-color: #343636 !important;
    border-color: #343636 !important;
  }

  .dark .fc-timegrid-event-harness-inset .fc-timegrid-event, .fc-timegrid-event.fc-event-mirror, .fc-timegrid-more-link {
    box-shadow: none !important; 
  }
`}</style>
        </div>
    );
};

export default Calendar;

