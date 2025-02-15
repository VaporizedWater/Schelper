"use client";

import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

import { EventClickArg } from "@fullcalendar/core";
import { useEffect, useState } from "react";
import { useCalendarContext } from "../CalendarContext/CalendarContext";

//use eventDragStop to constrain the date (both start and end times retaining duration) between 8AM and 5PM

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

const Calendar2 = () => {
    const [newEventText, setEvent] = useState<string | null>();
    const [oneClass, setOneClass] = useState(false); // Used for debounce to ensure only one class is added at a time
    const { currCombinedClass, updateCurrClass, displayClasses, displayEvents } = useCalendarContext()

    useEffect(() => {
        const newEvent: string | null = localStorage.getItem("newEvent");
        setEvent(newEvent);
        setOneClass(true);
    }, [setEvent]);

    if (oneClass && newEventText) {
        setOneClass(false);
    }

    function unselectAll() {
        selectedEvents.forEach(element => {
            if (element) {
                element.style.borderColor = 'transparent';
            }
        });

        // Then, clear the array after the loop
        selectedEvents.length = 0;  // This effectively empties the array
    }

    useEffect(() => {
        function downHandler() {
            // empty for now
        }

        function upHandler(event: KeyboardEvent) {
            if (event.key === 'Control') {
                unselectAll();
            }
        }

        function clickHandler(event: MouseEvent) {
            if (event.ctrlKey) {
                event.preventDefault();
                return false;
            }
        }

        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);
        window.addEventListener('click', clickHandler);

        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
            window.removeEventListener('click', clickHandler);
        };
    }, []);

    const handleEventClick = (info: EventClickArg) => {
        unselectAll();
        info.el.style.borderColor = 'red';
        selectedEvents.push(info.el);

        const foundClass = displayClasses.find((item) => item.event?.extendedProps?.combinedClassId === info.event.extendedProps.combinedClassId);

        if (foundClass) {
            updateCurrClass(foundClass);
        }
    }

    // Use eventDrop callback and snap class to standard timeslots unless ctrl is pressed -> drops to 5 min snapDuration
    // Possibly resize the event so it also is the correct size within this timeslot

    const fullCalendar = (
        <FullCalendar
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
        // eventDrop={}
        />
    );

    return (
        <div className="h-[75vh]">
            {fullCalendar}
        </div>

    );
};

export default Calendar2;