// Sub-component (child) of Calendar
// Parent of TimeGridCell
import { DayProps } from "@/lib/types";
import TimeGridCell from "../TimeGridCell/TimeGridCell";

const TimeOfDay = (props: DayProps) => {
    return (
        <ul className="flex flex-col">
            {Array.from({ length: 48 }, (_, i) => (
                <li key={i} className="">
                    <TimeGridCell droppableId={props.day + ":" + i}/>
                </li>
            ))}
        </ul>
    );
}

export default TimeOfDay;