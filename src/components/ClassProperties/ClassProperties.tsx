// List of property components.
// Parent of Property

import { useCalendarContext } from "../CalendarContext/CalendarContext";

const ClassProperties = () => {
    const { currCombinedClass } = useCalendarContext();

    return (
        <ul className="flex flex-col">
            <li className="border-b-2">{currCombinedClass?.classData.course_subject}</li>
            <li className="border-b-2">{currCombinedClass?.classData.course_num}</li>
            <li className="border-b-2">{currCombinedClass?.classData.title}</li>
            <li className="border-b-2">{currCombinedClass?.classProperties.instructor_name}</li>
            <li className="border-b-2">{currCombinedClass?.classProperties.days.join(", ")}</li>
            {/* <li className="border-b-2">{currCombinedClass?.classProperties.tags}</li> */}
        </ul>
    );
}

export default ClassProperties;