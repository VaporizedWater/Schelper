"use client";

import { useRouter } from "next/navigation";
import { Class, ClassProperty } from "@/lib/types";
import { insertCombinedClass } from "@/lib/utils";
import { useLocalStorage } from 'usehooks-ts'
import DropDown from "@/components/DropDown/DropDown";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import { EventInput } from "@fullcalendar/core/index.js";
import { newDefaultEmptyClass } from "@/lib/common";

const NewClassForm = () => {
    const [title, setTitle, clearTitle] = useLocalStorage("title", "", { initializeWithValue: false });
    const [day, setDay] = useLocalStorage("day", "Mon", { initializeWithValue: false });
    const [startTime, setStartTime, clearStartTime] = useLocalStorage("startTime", "", { initializeWithValue: false });
    const [endTime, setEndTime, clearEndTime] = useLocalStorage("endTime", "", { initializeWithValue: false });
    const [classInfo, setClassInfo] = useLocalStorage<Class>("classInfo", {} as Class, { initializeWithValue: false });
    const [classProperties, setClassProperties] = useLocalStorage<ClassProperty>("classProperties", {} as ClassProperty, { initializeWithValue: false });
    const [classEvent, setClassEvent] = useLocalStorage("newEvent", "", { initializeWithValue: false });
    const [selectedTags, setSelectedTags, clearSelectedTags] = useLocalStorage<string[]>("selectedTags", [], { initializeWithValue: false });
    const { allTags } = useCalendarContext();

    const router = useRouter();

    const clearState = () => {
        clearTitle();
        setDay("Mon");
        clearStartTime();
        clearEndTime();
        setClassInfo({} as Class);
        setClassProperties({} as ClassProperty);
        clearSelectedTags();
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !day || !startTime || !endTime) {
            alert("Please fill out all fields");
            return;
        }

        // Blank tags for now by default until we take them as input
        setClassProperties({ ...classProperties, tags: [] } as ClassProperty);

        const newClassEvent: EventInput = {
            title,
            day,
            startTime,
            endTime,
        };

        setClassEvent(JSON.stringify(newClassEvent));
        console.log(classEvent);

        const defaultCombined = newDefaultEmptyClass();

        // Testing POST Request
        if (classInfo) {
            defaultCombined.classData._id = classInfo._id;
            defaultCombined.classData.catalog_num = classInfo.catalog_num;
            defaultCombined.classData.class_num = classInfo.class_num;
            defaultCombined.classData.session = classInfo.session;
            defaultCombined.classData.course_subject = classInfo.course_subject;
            defaultCombined.classData.course_num = classInfo.course_num;
            defaultCombined.classData.section = classInfo.section;
            defaultCombined.classData.location = classInfo.location;
            defaultCombined.classData.enrollment_cap = classInfo.enrollment_cap;
            defaultCombined.classData.waitlist_cap = classInfo.waitlist_cap;
        }
        if (classProperties) {
            defaultCombined.classProperties._id = classProperties._id;
            defaultCombined.classProperties.class_status = classProperties.class_status;
            defaultCombined.classProperties.facility_id = classProperties.facility_id;
            defaultCombined.classProperties.room = classProperties.room;
            defaultCombined.classProperties.instructor_email = classProperties.instructor_email;
            defaultCombined.classProperties.instructor_name = classProperties.instructor_name;
            defaultCombined.classProperties.total_enrolled = classProperties.total_enrolled;
            defaultCombined.classProperties.total_waitlisted = classProperties.total_waitlisted;
            defaultCombined.classProperties.days = classProperties.days.length > 0 ? classProperties.days : defaultCombined.classProperties.days;
            defaultCombined.classProperties.start_time = classProperties.start_time;
            defaultCombined.classProperties.end_time = classProperties.end_time;
            defaultCombined.classProperties.tags = classProperties.tags.length > 0 ? classProperties.tags : defaultCombined.classProperties.tags;
        }
        insertCombinedClass(defaultCombined);

        // Update the context as well

        // Clear state
        clearState();

        // Navigate back (optional)
        router.back();
    };

    return (
        <div className="p-8 mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Create New Class</h2>
            <div className="">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" onReset={clearState}>
                    {/* For class as well as class_property */}
                    <input
                        type="text"
                        placeholder="Class Title"
                        value={title}
                        onChange={(e) => { setTitle(e.target.value); setClassInfo({ ...classInfo, title: e.target.value } as Class) }}
                        className="p-2 border rounded"
                    />
                    <select
                        value={day}
                        onChange={(e) => { setDay(e.target.value); setClassProperties({ ...classProperties, days: [e.target.value] } as ClassProperty) }}
                        className="p-2 border rounded"
                    >
                        <option value="Mon">Monday</option>
                        <option value="Tue">Tuesday</option>
                        <option value="Wed">Wednesday</option>
                        <option value="Thu">Thursday</option>
                        <option value="Fri">Friday</option>
                    </select>
                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => { setStartTime(e.target.value); setClassProperties({ ...classProperties, start_time: e.target.value } as ClassProperty) }}
                        className="p-2 border rounded"
                    />
                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => { setEndTime(e.target.value); setClassProperties({ ...classProperties, end_time: e.target.value } as ClassProperty) }}
                        className="p-2 border rounded"
                    />
                    <input
                        type="number"
                        placeholder="Catalog Number"
                        value={classInfo.catalog_num}
                        onChange={(e) => setClassInfo({ ...classInfo, catalog_num: e.target.value } as Class)}
                        className="p-2 border rounded"
                    />
                    <input
                        type="number"
                        placeholder="Class Number"
                        value={classInfo.class_num}
                        onChange={(e) => setClassInfo({ ...classInfo, class_num: e.target.value } as Class)}
                        className="p-2 border rounded"
                    />
                    <input
                        type="number"
                        placeholder="Session"
                        value={classInfo.session}
                        onChange={(e) => setClassInfo({ ...classInfo, session: e.target.value } as Class)}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Course Subject"
                        value={classInfo.course_subject}
                        onChange={(e) => setClassInfo({ ...classInfo, course_subject: e.target.value } as Class)}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Course Number"
                        value={classInfo.course_num}
                        onChange={(e) => setClassInfo({ ...classInfo, course_num: e.target.value } as Class)}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Section"
                        value={classInfo.section}
                        onChange={(e) => setClassInfo({ ...classInfo, section: e.target.value } as Class)}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Location"
                        value={classInfo.location}
                        onChange={(e) => setClassInfo({ ...classInfo, location: e.target.value } as Class)}
                        className="p-2 border rounded"
                    />
                    <input
                        type="number"
                        placeholder="Enrollment Capacity"
                        value={classInfo.enrollment_cap}
                        onChange={(e) => setClassInfo({ ...classInfo, enrollment_cap: e.target.value } as Class)}
                        className="p-2 border rounded"
                    />
                    <input
                        type="number"
                        placeholder="Waitlist Capacity"
                        value={classInfo.waitlist_cap}
                        onChange={(e) => setClassInfo({ ...classInfo, waitlist_cap: e.target.value } as Class)}
                        className="p-2 border rounded"
                    />

                    {/*Other Class Properties: class status, facility id, room, instructor email, total enrolled, total waitlisted*/}
                    <div className="p-2">Class Properties</div>

                    <input
                        type="text"
                        placeholder="Class Status"
                        value={classProperties.class_status}
                        onChange={(e) => setClassProperties({ ...classProperties, class_status: e.target.value } as ClassProperty)}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Facility ID"
                        value={classProperties.facility_id}
                        onChange={(e) => setClassProperties({ ...classProperties, facility_id: e.target.value } as ClassProperty)}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Room"
                        value={classProperties.room}
                        onChange={(e) => setClassProperties({ ...classProperties, room: e.target.value } as ClassProperty)}
                        className="p-2 border rounded"
                    />

                    <input
                        type="text"
                        placeholder="Instructor Email"
                        value={classProperties.instructor_email}
                        onChange={(e) => setClassProperties({ ...classProperties, instructor_email: e.target.value } as ClassProperty)}
                        className="p-2 border rounded"
                    />

                    <input
                        type="text"
                        placeholder="Instructor Name"
                        value={classProperties.instructor_name}
                        onChange={(e) => setClassProperties({ ...classProperties, instructor_name: e.target.value } as ClassProperty)}
                        className="p-2 border rounded"
                    />

                    <input
                        type="number"
                        placeholder="Total Enrolled"
                        value={classProperties.total_enrolled}
                        onChange={(e) => setClassProperties({ ...classProperties, total_enrolled: e.target.value } as ClassProperty)}
                        className="p-2 border rounded"
                    />

                    <input
                        type="number"
                        placeholder="Total Waitlisted"
                        value={classProperties.total_waitlisted}
                        onChange={(e) => setClassProperties({ ...classProperties, total_waitlisted: e.target.value } as ClassProperty)}
                        className="p-2 border rounded"
                    />

                    {/* Display dropdown of tags that can be checked */}
                    <DropDown
                        buttonClassName="p-2 border rounded w-full"
                        renderButton={(isOpen) => (
                            <div className="flex justify-between items-center cursor-pointer">
                                <span>Select Tags ({selectedTags.length})</span>
                                {isOpen ? <MdExpandLess /> : <MdExpandMore />}
                            </div>
                        )}
                        renderDropdown={() => (
                            <div className="p-2 border rounded flex flex-col gap-2">
                                {[...allTags].map((tag) => (
                                    <label key={tag} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedTags.includes(tag)}
                                            onChange={(e) => {
                                                let newTags: string[];
                                                if (e.target.checked) {
                                                    newTags = [...selectedTags, tag];
                                                } else {
                                                    newTags = selectedTags.filter(t => t !== tag);
                                                }
                                                setSelectedTags(newTags);
                                                setClassProperties({
                                                    ...classProperties,
                                                    tags: newTags
                                                } as ClassProperty);
                                            }}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">{tag}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    />

                    <div className="flex flex-row gap-2">
                        {/* Clear button */}
                        <button type="reset" className="bg-gray-300 text-black p-2 rounded flex-grow">
                            Clear
                        </button>
                        <button type="submit" className="bg-blue-500 text-white p-2 rounded flex-grow">
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewClassForm;