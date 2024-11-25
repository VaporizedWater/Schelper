// Child (sub-component) of Calendar
import { DayProps } from "@/app/api/types";
import { DndContext } from "@dnd-kit/core";

const Day = (props: DayProps) => {

    return (
        <div className="flex flex-col items-center">
            <div className="text-lightblack text-sm">{props.dayName.toUpperCase()} </div>
            <div className="text-lightblack opacity-70 duration-10 rounded-full hover:bg-gray-200 flex items-center p-2">{props.date} </div>
        </div>
    );
}

export default Day;