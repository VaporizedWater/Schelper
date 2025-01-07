import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { CalendarProps } from "@/lib/types";
import { EventClickArg, EventSourceInput } from "@fullcalendar/core/index.js";
import { useEffect, useRef } from "react";
import LeftMenu from "../LeftMenu/LeftMenu";

const events: EventSourceInput = [
    {
        title: 'Class 1',
        start: '2025-01-01T08:00:00',
        end: '2025-01-01T09:00:00'
    },
    {
        title: 'Class 2',
        start: '2025-01-02T09:00:00',
        end: '2025-01-02T10:00:00'
    },
];

const selectedEvents: HTMLElement[] = [];

const Calendar2 = (props: CalendarProps) => {
    const ctrlHeldRef = useRef(false);

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

    return (
        <div className="flex flex-row">
            <div className="w-1/6">
                <LeftMenu></LeftMenu>
            </div>
            <div className="w-3/4">
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
                />
            </div>


        </div>
    );
};

export default Calendar2;