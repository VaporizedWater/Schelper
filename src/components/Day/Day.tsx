// Child (sub-component) of Calendar
import { DayProps } from "@/app/api/types";
import { DndContext } from "@dnd-kit/core";

const Day = (props: DayProps) => {

    return (
        <div className="flex flex-col">
            <div>{props.dayName} </div>
        </div>
    );
}

export default Day;