"use client";

import FullCalendar from "@fullcalendar/react";
import interactionPlugin, { EventResizeStopArg } from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

import { EventClickArg, EventDropArg, EventInput } from "@fullcalendar/core";
import { useRef, useEffect } from "react";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { createEventsFromCombinedClass, defaultBackgroundColor, newDefaultEmptyClass, selectedBackgroundColor, ShortenedDays } from "@/lib/common";

const selectedEvents: HTMLElement[] = [];

const viewFiveDays = {
    viewFiveDays: {
        type: 'timeGrid',
        visibleRange: {
            start: '2025-01-06',
            end: '2025-01-11'
        }
    }
}

const Calendar = () => {
    const calendarRef = useRef<FullCalendar>(null);
    const { setCurrentClass, updateOneClass, detectConflicts, displayClasses, displayEvents, conflicts } = useCalendarContext();

    

    // Detect conflicts when the calendar renders or updates
    useEffect(() => {
        detectConflicts();
    }, [displayClasses]); // Re-detect conflicts when classes change

    function findClass(info: EventClickArg | EventDropArg | EventResizeStopArg) {
        return displayClasses.find(
            (item) => {
                let found = false;
                if (item.events) {
                    item.events.forEach((event: EventInput) => {
                        if (event.extendedProps?.combinedClassId === info.event.extendedProps.combinedClassId) {
                            found = true;
                        }
                    });
                } else {
                    console.log("No events found");
                }
                return found;
            }
        );
    }

    function unselectAll() {
        selectedEvents.forEach(element => {
            if (element) {
                element.style.backgroundColor = defaultBackgroundColor;
                // Remove the ctrl click effect
            }
        });

        selectedEvents.length = 0;
    }

    const handleEventClick = (info: EventClickArg) => {
        unselectAll();
        info.el.style.backgroundColor = selectedBackgroundColor
        selectedEvents.push(info.el);

        const foundClass = findClass(info);

        if (foundClass) {
            console.log("Class found");
            setCurrentClass(foundClass);
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
            console.log(newStart + "\n", newEnd + "\n", newDay + "\n");

            if (!newStart || !newEnd || !newDay) {
                return;
            }

            foundClass.properties.start_time = newStart;
            foundClass.properties.end_time = newEnd;
            foundClass.properties.days = [newDay];
            foundClass.events = createEventsFromCombinedClass(foundClass);

            updateOneClass(foundClass);
        }
    }

    const handleEventResize = (info: EventResizeStopArg) => {
        const foundClass = findClass(info);

        if (foundClass) {
            const newEnd = info.event.end?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

            if (!newEnd) {
                return;
            }

            foundClass.properties.end_time = newEnd;
            foundClass.events = createEventsFromCombinedClass(foundClass);
            updateOneClass(foundClass);
        }
    }

    // Highlight conflicting events with appropriate colors based on conflict type
    const eventContent = (eventInfo: EventInput) => {
        const classId = eventInfo.event.extendedProps.combinedClassId;

        // Find conflicts involving this class
        const classConflicts = conflicts.filter(conflict =>
            conflict.class1._id === classId ||
            conflict.class2._id === classId
        );

        // Default color if no conflict
        let backgroundColor = '#3788d8';

        if (classConflicts.length > 0) {
            // Determine most severe conflict type (both > room > instructor)
            const hasBothConflict = classConflicts.some(c => c.conflictType === "both");
            const hasRoomConflict = classConflicts.some(c => c.conflictType === "room");
            const hasInstructorConflict = classConflicts.some(c => c.conflictType === "instructor");

            if (hasBothConflict) {
                backgroundColor = 'red'; // Room + Instructor conflict
            } else if (hasRoomConflict) {
                backgroundColor = '#f59e0b'; // Amber for room conflicts
            } else if (hasInstructorConflict) {
                backgroundColor = '#f97316'; // Orange for instructor conflicts
            }
        }

        return {
            html: `<div style="
                    background-color: ${backgroundColor}; 
                    color: white;
                    padding: 2px 4px;
                    border-radius: 2px;
                ">
                    ${eventInfo.event.title}
                </div>`
        };
    };

    return (
        <div className="h-full">
            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, interactionPlugin]}
                editable
                expandRows
                selectable={false}
                events={displayEvents}
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
            />
        </div>
    );
};

export default Calendar;
