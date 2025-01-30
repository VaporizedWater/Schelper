// List of property components.
// Parent of Property

import Property from "../Property/Property";
import { useClassContext } from "../ClassContext/ClassContext";

const ClassProperties = () => {
    const { currClass } = useClassContext();

    return (
        <ul className="flex flex-col">
            <li><Property property="Class Name" value="SWENG 480" /></li>
            <li><Property property="Instructor" value="Dr. Ibrahim" /></li>
            <li><Property property="Weekdays" value="All" /></li>
            <li><Property property="Times" value="11AM - 12PM" /></li>
            <li>{currClass?.classData.course_subject}</li>
        </ul>
    );
}

export default ClassProperties;