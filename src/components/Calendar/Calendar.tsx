"use client";

import FullCalendar from "@fullcalendar/react";
import interactionPlugin, { EventResizeStopArg } from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

import { EventClickArg, EventDropArg, EventInput } from "@fullcalendar/core";
import { useRef, useEffect } from "react";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { createEventFromCombinedClass, emptyCombinedClass, ShortenedDays } from "@/lib/common";

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

    function unselectAll() {
        selectedEvents.forEach(element => {
            if (element) {
                element.style.borderColor = 'transparent';

                // Remove the ctrl click effect
            }
        });

        selectedEvents.length = 0;
    }

    const handleEventClick = (info: EventClickArg) => {
        unselectAll();
        info.el.style.borderColor = 'red';
        selectedEvents.push(info.el);

        const foundClass = displayClasses.find((item) => item.event?.extendedProps?.combinedClassId === info.event.extendedProps.combinedClassId);

        if (foundClass) {
            setCurrentClass(foundClass);
        }
    }

    // This triggers when clicking on any date/time slot that isn't an event
    const handleDateClick = () => {
        unselectAll();
        setCurrentClass(emptyCombinedClass);
    };

    const handleEventDrop = (info: EventDropArg) => {
        // Update the class in the context
        const foundClass = displayClasses.find((item) => item.event?.extendedProps?.combinedClassId === info.event.extendedProps.combinedClassId);

        if (foundClass) {
            // Get the new start and end times and the day if changed
            const newStart = info.event.start?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            const newEnd = info.event.end?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
            const newDay = ShortenedDays[(info.event.start?.getDay() ?? 1) - 1];
            console.log(newStart + "\n", newEnd + "\n", newDay + "\n");

            if (!newStart || !newEnd || !newDay) {
                return;
            }

            foundClass.classProperties.start_time = newStart;
            foundClass.classProperties.end_time = newEnd;
            foundClass.classProperties.days = [newDay];
            foundClass.event = createEventFromCombinedClass(foundClass);

            updateOneClass(foundClass);
        }
    }

    const handleEventResize = (info: EventResizeStopArg) => {
        const foundClass = displayClasses.find((item) => item.event?.extendedProps?.combinedClassId === info.event.extendedProps.combinedClassId);

        if (foundClass) {
            const newEnd = info.event.end?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

            if (!newEnd) {
                return;
            }

            foundClass.classProperties.end_time = newEnd;
            foundClass.event = createEventFromCombinedClass(foundClass);
            updateOneClass(foundClass);
        }
    }

    // Highlight conflicting events with appropriate colors based on conflict type
    const eventContent = (eventInfo: EventInput) => {
        const classId = eventInfo.event.extendedProps.combinedClassId;

        // Find conflicts involving this class
        const classConflicts = conflicts.filter(conflict =>
            conflict.class1.classData._id === classId ||
            conflict.class2.classData._id === classId
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
