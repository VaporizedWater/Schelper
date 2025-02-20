"use client";

import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

import { EventClickArg } from "@fullcalendar/core";
import { useRef } from "react";
import { useCalendarContext } from "../CalendarContext/CalendarContext";

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
    const { updateCurrClass, displayClasses, displayEvents } = useCalendarContext();

    function unselectAll() {
        selectedEvents.forEach(element => {
            if (element) {
                element.style.borderColor = 'transparent';
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
            updateCurrClass(foundClass);
        }
    }

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
                slotMaxTime={'17:00:00'}
                snapDuration={'00:05:00'}
                eventClick={handleEventClick}
                allDaySlot={false}
                initialView='viewFiveDays'
                views={viewFiveDays}
                headerToolbar={false}
                height={'100%'}
                dayHeaderFormat={{ 'weekday': 'long' }}
            />
        </div>
    );
};

export default Calendar;