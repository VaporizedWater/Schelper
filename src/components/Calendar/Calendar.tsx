"use client";

import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { CalendarProps, FullCalendarClassEvent } from "@/lib/types";
import { EventClickArg, EventInput } from "@fullcalendar/core/index.js";
import { useEffect, useRef, useState } from "react";
import LeftMenu from "../LeftMenu/LeftMenu";
import CalendarNav from "../CalendarNav/CalendarNav";
import CalendarSheet from "../CalendarSheet/CalendarSheet";
import { useCalendarContext } from "../CalendarContext/CalendarContext";


//use eventDragStop to constrain the date (both start and end times retaining duration) between 8AM and 5PM
//


//
let events: EventInput[] = [
    // {
    //     title: 'Class 1',
    //     start: '2025-01-07T08:00:00',
    //     end: '2025-01-07T09:00:00'
    // },
    // {
    //     title: 'Class 2',
    //     start: '2025-01-06T09:00:00',
    //     end: '2025-01-06T10:00:00',
    // },
];
const addEvent = (item: EventInput) => {
    events = [...new Set([...events, item])]
};

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
    const ctrlHeldRef = useRef(false);
    const [newEventText, setEvent] = useState<string | null>();
    const [oneClass, setOneClass] = useState(false); // Used for debounce to ensure only one class is added at a time
    const [isCalendarOpen, setCalendarOpen] = useState(true);
    const { allEvents, currCombinedClass, updateCurrClass, allClasses, displayClasses, displayEvents } = useCalendarContext()

    useEffect(() => {
        const newEvent: string | null = localStorage.getItem("newEvent");
        setEvent(newEvent);
        setOneClass(true);
    }, [setEvent]);

    if (oneClass && newEventText) {
        const newEvent: FullCalendarClassEvent = JSON.parse(newEventText);

        // addEvent({
        //     title: newEvent.title,
        //     start: dateStringStart,
        //     end: dateStringEnd
        // } as EventInput);
        console.log(events);
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
        function downHandler(event: KeyboardEvent) {
            if (event.key === 'Control') {
                ctrlHeldRef.current = true;
            }
        }

        function upHandler(event: KeyboardEvent) {
            if (event.key === 'Control') {
                ctrlHeldRef.current = false;
                unselectAll();
            }
            console.log("Key up");
        }

        function clickHandler(event: MouseEvent) {
            // updateCurrClass();

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
        // Handle old elements
        if (!ctrlHeldRef) {
            unselectAll();
        }

        info.el.style.borderColor = 'red';

        const foundClass = displayClasses.find((item) => item.event?.extendedProps?.combinedClassId === info.event.extendedProps.combinedClassId);

        if (foundClass) {
            updateCurrClass(foundClass);
        }

        console.log("Current Class: \n" + JSON.stringify(currCombinedClass));
    }

    // Use eventDrop callback and snap the class to standard timeslots unless the control key is pressed, 
    // which then drops it to the 5 minute sanpDuration
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
        />
    );

    return (
        <div className="flex flex-row">
            <div className="w-[20vh] flex flex-col">
                <LeftMenu />
            </div>
            <div className="w-[80vw] flex flex-col">
                <div>
                    <CalendarNav toggleCalendar={(status: boolean) => setCalendarOpen(status)} />
                </div>
                <div className="rounded-b-3xl min-h-[80vh]">
                    {isCalendarOpen ?
                        fullCalendar :
                        <div className="overflow-x-auto scrollbar-thin">
                            <CalendarSheet />
                        </div>

                    }
                </div>
            </div>
        </div >
    );
};

export default Calendar;