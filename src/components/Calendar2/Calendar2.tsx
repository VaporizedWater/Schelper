import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { CalendarProps } from "@/lib/types";
import { EventSourceInput } from "@fullcalendar/core/index.js";

const Calendar2 = (props: CalendarProps) => {
    const events: EventSourceInput = [
        {
            title: 'Class 1',
            start: '2025-01-01T08:00:00',
            end: '2025-01-01T09:00:00'
        },
    ];

    return (
        <div className="w-1/2 self-center">
            <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                editable
                selectable
                events={events}
                slotDuration={'00:30:00'}
                slotMinTime={'08:00:00'}
                slotMaxTime={'17:00:00'}
                expandRows
                snapDuration={'00:05:00'}
            />
        </div>
    );
};

export default Calendar2;