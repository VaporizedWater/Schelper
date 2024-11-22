// List of property components.
// Parent of Property

import Property from "../Property/Property";
import { ClassInfo } from "@/app/api/types";

const ClassProperties = () => {
    return (
        <ul className="flex flex-col">
            <li><Property property="Class Name" value="SWENG 480" /></li>
            <li><Property property="Instructor" value="Dr. Ibrahim" /></li>
            <li><Property property="Weekdays" value="All" /></li>
            <li><Property property="Times" value="11AM - 12PM" /></li>
        </ul>
    );
}

export default ClassProperties;