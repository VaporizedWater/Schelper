"use client";

import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { CalendarProps, FullCalendarClassEvent } from "@/lib/types";
import { EventClickArg, EventInput, EventSourceInput } from "@fullcalendar/core/index.js";
import { useEffect, useRef, useState } from "react";
import LeftMenu from "../LeftMenu/LeftMenu";
import { ClassProvider, useClassContext } from "../ClassContext/ClassContext";
import CalendarNav from "../CalendarNav/CalendarNav";
import CalendarSheet from "../CalendarSheet/CalendarSheet";
import * as bootstrap from "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const days: { [key: string]: string } = {
    Mon: '2025-01-06',
    Tues: '2025-01-07',
    Wed: '2025-01-08',
    Thurs: '2025-01-09',
    Fri: '2025-01-10',
};

//use eventDragStop to constrain the date (both start and end times retaining duration) between 8AM and 5PM
//

// const allCombinedClasses: CombinedClass[] = []; // Replace [] with the util function to get all classes
//
let events: EventInput[] = [
    {
        title: 'Class 1',
        start: '2025-01-07T08:00:00',
        end: '2025-01-07T09:00:00'
    },
    {
        title: 'Class 2',
        start: '2025-01-06T09:00:00',
        end: '2025-01-06T10:00:00'
    },
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

const Calendar = (props: CalendarProps) => {
    const ctrlHeldRef = useRef(false);
    const [newEventText, setEvent] = useState<string | null>();
    const [oneClass, setOneClass] = useState(false); // Used for debounce to ensure only one class is added at a time
    // const { currClass, updateClass } = useClassContext();
    const [isCalendarOpen, setCalendarOpen] = useState(true);

    useEffect(() => {
        const newEvent: string | null = localStorage.getItem("newEvent");
        setEvent(newEvent);
        setOneClass(true);
    }, [setEvent]);

    if (oneClass && newEventText) {
        let newEvent: FullCalendarClassEvent = JSON.parse(newEventText);
        let convertedDay = days[newEvent.day];
        let dateStringStart = convertedDay + 'T' + newEvent.startTime;
        let dateStringEnd = convertedDay + 'T' + newEvent.endTime;

        addEvent({
            title: newEvent.title,
            start: dateStringStart,
            end: dateStringEnd
        } as EventInput);
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
        // updateClass();

        if (event.ctrlKey) {
            event.preventDefault();
            return false;
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);
        window.addEventListener('click', clickHandler);

        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
            window.removeEventListener('click', clickHandler);
        };
    }, [downHandler, upHandler, clickHandler]);

    // Use eventDrop callback and snap the class to standard timeslots unless the control key is pressed, 
    // which then drops it to the 5 minute sanpDuration
    // Possibly resize the event so it also is the correct size within this timeslot

    const fullCalendar = (
        <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            editable
            expandRows
            selectable={false}
            events={events}
            slotDuration={'00:30:00'}
            slotMinTime={'08:00:00'}
            slotMaxTime={'17:00:00'}
            snapDuration={'00:05:00'}
            eventClick={(info: EventClickArg) => {
                // Handle old elements
                if (!ctrlHeldRef) {
                    unselectAll();
                }


                // Handle new element
                console.log(info.el.className);
                selectedEvents.push(info.el);
                info.el.style.borderColor = 'red';
            }}
            initialView='viewFiveDays'
            views={viewFiveDays}
            headerToolbar={false}

            eventDidMount={(info) => {
                const startTime = info.event.start ? info.event.start.toLocaleString() : "No Start Time";
                const endTime = info.event.end ? info.event.end.toLocaleString() : "No End Time";

                return new bootstrap.Popover(info.el, {
                    title: info.event.title,
                    placement: "auto",
                    trigger: "click",
                    customClass: "popoverStyle",
                    content: `Start: ${startTime}<br>End: ${endTime}`,
                    html: true,
                });
            }}



            height={'100%'}
            dayHeaderFormat={{ 'weekday': 'long' }}
        />
    );

    return (
        <ClassProvider >
            <div className="flex flex-row">
                <div className="w-[20vh] flex flex-col">
                    <LeftMenu></LeftMenu>
                </div>
                <div className="w-[80vw] flex flex-col">
                    <div>
                        <CalendarNav toggleCalendar={(status: boolean) => setCalendarOpen(status)}></CalendarNav>
                    </div>
                    <div className="rounded-b-3xl min-h-[80vh]">
                        {isCalendarOpen ?
                            fullCalendar :
                            <CalendarSheet></CalendarSheet>
                        }
                    </div>
                </div>
            </div>
        </ClassProvider >
    );
};

export default Calendar;