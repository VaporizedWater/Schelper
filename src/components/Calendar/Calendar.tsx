"use client";

import FullCalendar from "@fullcalendar/react";
import interactionPlugin, { EventResizeStopArg } from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

import { BusinessHoursInput, EventClickArg, EventDropArg, EventInput } from "@fullcalendar/core";
import { useRef, useEffect, useState, useCallback } from "react";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { createEventsFromCombinedClass, dayIndex, defaultBackgroundColor, newDefaultEmptyClass, selectedBackgroundColor, ShortenedDays, viewFiveDays } from "@/lib/common";
import { CombinedClass } from "@/lib/types";
import { match } from "assert";

const selectedEvents: HTMLElement[] = [];

const Calendar = () => {
    const calendarRef = useRef<FullCalendar>(null);
    const { faculty, allClasses, setCurrentClass, updateOneClass, detectConflicts, currentCombinedClass, conflicts, isLoading } = useCalendarContext();
    const [events, setEvents] = useState<EventInput[]>([]);
    const [businessHours, setBusinessHours] = useState<BusinessHoursInput>([] as EventInput[]);

    // Create events efficiently when displayClasses changes
    useEffect(() => {
        const displayClasses = allClasses.filter(cls => cls.visible);

        // console.time("Calendar:createEvents");
        if (!displayClasses || displayClasses.length === 0) {
            setEvents([]);
            // console.timeEnd("Calendar:createEvents");
            return;
        }

        const newEvents: EventInput[] = [];

        displayClasses.forEach(cls => {
            if (cls._id) {
                const classEvents = createEventsFromCombinedClass(cls);

                // Add class reference to each event's extendedProps
                classEvents.forEach(event => {
                    if (!event.extendedProps) event.extendedProps = {};
                    event.extendedProps.combinedClass = cls; // Store the actual class reference
                });

                // Store for reference
                cls.events = classEvents;

                // Add to our collections
                newEvents.push(...classEvents);
            }
        });

        setEvents(newEvents);
        detectConflicts();
        // console.timeEnd("Calendar:createEvents");
    }, [allClasses]); // eslint-disable-line react-hooks/exhaustive-deps

    // Update events for a single class (much more efficient)
    const updateEventsForClass = useCallback((updatedClass: CombinedClass) => {
        if (!updatedClass._id) return;

        // console.time("Calendar:updateEventsForClass");
        const newClassEvents = createEventsFromCombinedClass(updatedClass);

        // Add class reference to each event's extendedProps
        newClassEvents.forEach(event => {
            if (!event.extendedProps) event.extendedProps = {};
            event.extendedProps.combinedClass = updatedClass; // Store the actual class reference
        });

        // Update the events array by replacing only events for this class
        setEvents(prev => {
            // Remove previous events for this class
            const filteredEvents = prev.filter(
                event => event.extendedProps?.combinedClassId !== updatedClass._id
            );

            // Add the new events
            return [...filteredEvents, ...newClassEvents];
        });
        // console.timeEnd("Calendar:updateEventsForClass");
    }, []);

    // Log events when they change
    useEffect(() => {
        console.log(`Events updated: ${events.length} total events`);
    }, [events]);

    // Enhanced findClass that uses our eventMap for better performance
    function findClass(info: EventClickArg | EventDropArg | EventResizeStopArg) {
        const displayClasses = allClasses.filter(cls => cls.visible);

        // Get the class directly from the event's extendedProps
        if (info.event.extendedProps?.combinedClass) {
            return info.event.extendedProps.combinedClass as CombinedClass;
        }

        // Fallback to lookup by ID if class reference is not available
        const classId = info.event.extendedProps.combinedClassId;
        return displayClasses.find(cls => cls._id === classId);
    }

    function unselectAll() {
        selectedEvents.forEach(element => {
            if (element) {
                element.style.backgroundColor = defaultBackgroundColor;
            }
        });

        selectedEvents.length = 0;
    }

    function selectEvent(element: HTMLElement) {
        element.style.backgroundColor = selectedBackgroundColor;
        selectedEvents.push(element);
    }

    const handleEventClick = (info: EventClickArg) => {
        unselectAll();
        selectEvent(info.el);

        const foundClass = findClass(info);

        if (foundClass) {
            const elements = document.getElementsByClassName(`event-${foundClass?._id}`);
            for (let i = 0; i < elements.length; i++) {
                selectEvent(elements[i] as HTMLElement);
            }

            setCurrentClass(foundClass);
            console.log("Current class: ", foundClass);

            // Use the instructor's email to find the matching Faculty record
            const instructorEmail = foundClass.properties.instructor_email;
            const matchedFaculty = faculty.find(
                (faculty) => faculty.email === instructorEmail
            );

            if (matchedFaculty) {
                const newBusinessHours: BusinessHoursInput = [] as EventInput[];

                Object.entries(matchedFaculty.unavailability).forEach(([dayKey, slots]) => {
                    slots.forEach(event => {
                        newBusinessHours.push({
                            daysOfWeek: [dayIndex[dayKey]],
                            startTime: event.start,
                            endTime: event.end,
                        });
                    });
                });

                setBusinessHours(newBusinessHours);
            } else {
                // If no matching record is found, clear all
                setBusinessHours([]);
            }
        } else {
            console.log("Class not found");
        }
    }

    // This triggers when clicking on any date/time slot that isn't an event
    const handleDateClick = () => {
        unselectAll();
        setCurrentClass(newDefaultEmptyClass());
    };

    const handleEventDrop = (info: EventDropArg) => {
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

            // Update locally first for immediate UI feedback
            updateEventsForClass(updatedClass);

            // Then update in context/database
            updateOneClass(updatedClass);
        }
    }

    const handleEventResize = (info: EventResizeStopArg) => {
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

            // Update locally first for immediate UI feedback
            updateEventsForClass(updatedClass);

            // Then update in context/database
            updateOneClass(updatedClass);
        }
    }

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

            if (hasAllConflict) {
                backgroundColor = 'red'; // Room + Instructor + Cohort conflict
            } else if (hasRoomInstructorConflict || hasRoomCohortConflict || hasInstructorCohortConflict) {
                backgroundColor = '#f97316'; // Orange for room + instructor or room + cohort or instructor + cohort conflicts
            } else if (hasRoomConflict || hasInstructorConflict || hasCohortConflict) {
                backgroundColor = '#f59e0b'; // Amber for room or instructor or cohort conflicts
            }
        }

        return {
            html: `<div style="
                    background-color: ${backgroundColor}; 
                    color: white;
                    padding: 2px 4px;
                    border-radius: 2px;
                    font-size: 1rem; /* Medium font size for events */
                ">
                    ${eventInfo.event.title}
                </div>`
        };
    }, [conflicts]);

    // EventInfo in types defines possibilities, but fullcalendar doesn't support typescript, so dont use it as the type here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventClassNames = (eventInfo: any) => {
        return `event-${eventInfo.event.extendedProps?.combinedClassId}`;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventMounted = (eventInfo: any) => {
        if (eventInfo.event.extendedProps?.combinedClassId === currentCombinedClass?._id) {
            selectEvent(eventInfo.el);
        }
    }

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-white bg-opacity-80">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-lg font-medium text-gray-700">Loading classes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full text-sm">
            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, interactionPlugin]}
                editable
                expandRows
                selectable={false}
                events={events} // Use local events instead of displayEvents
                slotDuration={'00:30:00'}
                slotMinTime={'08:00:00'}
                slotMaxTime={'21:00:00'}
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
            />

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
            `}</style>
        </div>
    );
};

export default Calendar;
