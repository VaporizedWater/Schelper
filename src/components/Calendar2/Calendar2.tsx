import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { CalendarProps } from "@/lib/types";
import { EventClickArg, EventSourceInput } from "@fullcalendar/core/index.js";
import { useEffect, useRef } from "react";

const Calendar2 = (props: CalendarProps) => {
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
    let selectedEvents: HTMLElement[] = [];

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

    useEffect(() => {
        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);

        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
        };
    }, [downHandler, upHandler]);

    

    return (
        <div className="w-1/2 self-center select-none">
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
    );
};

export default Calendar2;