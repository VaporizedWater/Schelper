// Child (sub-component) of Calendar
import { DayProps } from "@/app/api/types";

const Day = (props: DayProps) => {

    return (
        <div className="flex flex-col">
            <div>{props.day} </div>
        </div>
    );
}

export default Day;