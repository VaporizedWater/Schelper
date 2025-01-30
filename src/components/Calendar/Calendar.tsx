"use client";

import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { CalendarProps, FullCalendarClassEvent, ProviderProps } from "@/lib/types";
import { EventClickArg, EventInput, EventSourceInput } from "@fullcalendar/core/index.js";
import { useContext, useEffect, useRef, useState } from "react";
import LeftMenu from "../LeftMenu/LeftMenu";
import { createContext } from "vm";

const days: { [key: string]: string } = {
    Mon: '2025-01-06',
    Tues: '2025-01-07',
    Wed: '2025-01-08',
    Thurs: '2025-01-09',
    Fri: '2025-01-10',
};

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
const ClassInfoContext = createContext();

export const ClassInfoProvider = ({ children }: ProviderProps) => {
    const [classInfo, setClassInfo] = useState<number>(109);

    return (
        <ClassInfoContext.Provider value={classInfo}>
            {children}
        </ClassInfoContext.Provider>
    )
}

const Calendar = (props: CalendarProps) => {
    const ctrlHeldRef = useRef(false);
    const [newEventText, setEvent] = useState<string | null>();
    const [oneClass, setOneClass] = useState(false); // Used for debounce to ensure only one class is added at a time

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


        />
    );

    return (
        <>
            <div className="flex flex-row">
                <div className="w-1/6">
                    <LeftMenu></LeftMenu>
                </div>
                <div className="w-3/4">
                    {fullCalendar}
                </div>
            </div>
        </>
    );
};

export default Calendar;