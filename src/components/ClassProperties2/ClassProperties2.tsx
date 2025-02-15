// List of property components.
// Parent of Property

import { useCalendarContext } from "../CalendarContext/CalendarContext";

const ClassProperties2 = () => {
    const { currCombinedClass } = useCalendarContext();

    return (
        <div className="flex flex-row">
            <ul className="flex flex-col">
                <li className="flex flex-row border-b-2 overflow-y-hidden">
                    Course Subject&nbsp;
                </li>
                <li className="flex flex-row border-b-2 overflow-y-hidden">
                    Course Num&nbsp;
                </li>
                <li className="flex flex-row border-b-2 overflow-y-hidden">
                    Course Title&nbsp;
                </li>
                <li className="flex flex-row border-b-2 overflow-y-hidden">
                    Instructor&nbsp;
                </li>
                <li className="flex flex-row border-b-2 overflow-y-hidden">
                    Days&nbsp;
                </li>
                <li className="flex flex-row border-b-2 overflow-y-hidden">
                    Tags&nbsp;
                </li>
            </ul>
            <ul className="flex flex-col">
                <li className="flex flex-row border-b-2 overflow-y-hidden">
                    | {currCombinedClass?.classData.course_subject}
                </li>
                <li className="flex flex-row border-b-2 overflow-y-hidden">
                    | {currCombinedClass?.classData.course_num}
                </li>
                <li className="flex flex-row border-b-2 overflow-y-hidden">
                    | {currCombinedClass?.classData.title}</li>
                <li className="flex flex-row border-b-2 overflow-y-hidden">
                    | {currCombinedClass?.classProperties.instructor_name}
                </li>
                <li className="flex flex-row border-b-2 overflow-y-hidden">
                    | {currCombinedClass?.classProperties.days.join(", ")}
                </li>
                <li className="flex flex-row border-b-2 overflow-y-hidden">
                    | {currCombinedClass?.classProperties.tags?.map(tag => tag.name).join(', ')}
                </li>
            </ul>
        </div>

    );
}

export default ClassProperties2;