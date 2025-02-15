import { useCalendarContext } from "../CalendarContext/CalendarContext";

const ClassProperties = () => {
    const { currCombinedClass } = useCalendarContext();

    return (
        <div className="">
            <ul className="flex flex-col w-full">
                <li className="flex border-b pb-1">
                    <span className="font-medium text-gray-700 min-w-24">Subject</span>
                    <span className="text-gray-900 flex-1">{currCombinedClass?.classData.course_subject || '-'}</span>
                </li>

                <li className="flex border-b pb-1">
                    <span className="font-medium text-gray-700 min-w-24">Number</span>
                    <span className="text-gray-900 flex-1">{currCombinedClass?.classData.course_num || '-'}</span>
                </li>

                <li className="flex border-b pb-1">
                    <span className="font-medium text-gray-700 min-w-24">Title</span>
                    <span className="text-gray-900 flex-1">{currCombinedClass?.classData.title || '-'}</span>
                </li>

                <li className="flex border-b pb-1">
                    <span className="font-medium text-gray-700 min-w-24">Instructor</span>
                    <span className="text-gray-900 flex-1">{currCombinedClass?.classProperties.instructor_name || '-'}</span>
                </li>

                <li className="flex border-b pb-1">
                    <span className="font-medium text-gray-700 min-w-24">Days</span>
                    <span className="text-gray-900 flex-1">{currCombinedClass?.classProperties.days.join(", ") || '-'}</span>
                </li>

                <li className="flex border-b pb-1">
                    <span className="font-medium text-gray-700 min-w-24">Tags</span>
                    <span className="text-gray-900 flex-1">
                        {currCombinedClass?.classProperties.tags?.map(tag => tag.name).join(', ') || '-'}
                    </span>
                </li>
            </ul>
        </div>
    );
}

export default ClassProperties;