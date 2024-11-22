// Sub-component (child) of Calendar
// Parent of TimeGridCell
import TimeGridCell from "../TimeGridCell/TimeGridCell";

const TimeOfDay = () => {
    return (
        <ul className="flex flex-col">
            {Array.from({ length: 48 }, (_, i) => (
                <li key={i} className="">
                    <TimeGridCell />
                </li>
            ))}
        </ul>
    );
}

export default TimeOfDay;