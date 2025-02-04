"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Class, ClassProperty, CombinedClass, FullCalendarClassEvent } from "@/lib/types";
import { ObjectId } from "mongodb";
import { insertClass, insertCombinedClass } from "@/lib/utils";
import useLocalStorage from "@/lib/hooks";

const NewClassForm = () => {
    const [title, setTitle, clearTitle] = useLocalStorage("title", "");
    const [day, setDay, clearDay] = useLocalStorage("day", "Mon");
    const [startTime, setStartTime, clearStartTime] = useLocalStorage("startTime", "");
    const [endTime, setEndTime, clearEndTime] = useLocalStorage("endTime", "");
    const [classInfo, setClassInfo, clearClassInfo] = useLocalStorage<Class>("classInfo", {} as Class);
    const [classProperties, setClassProperties, clearClassProperties] = useLocalStorage<ClassProperty>("classProperties", {} as ClassProperty);

    const router = useRouter();

    const clearState = () => {
        clearTitle();
        clearDay();
        clearStartTime();
        clearEndTime();
        setClassInfo({} as Class);
        setClassProperties({} as ClassProperty);

        // setDay("Mon");
        // setStartTime("");
        // setEndTime("");

        // clearClassInfo();
        // clearClassProperties();
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !day || !startTime || !endTime) {
            alert("Please fill out all fields");
            return;
        }

        const newEvent: FullCalendarClassEvent = {
            title,
            day,
            startTime,
            endTime,
        };

        // Store new event temporarily
        localStorage.setItem("newEvent", JSON.stringify(newEvent));

        // Testing POST Request
        defaultCombined.classData = classInfo ?? defaultClass;
        defaultCombined.classProperties = classProperties ?? defaultProperties;
        insertCombinedClass(defaultCombined);

        // Clear state
        clearState();

        // Navigate back (optional)
        router.back();
    };

    const defaultClass: Class = {
        // object_id: {} as ObjectId,
        _id: "",
        catalog_num: "1",
        class_num: "1",
        session: "1",
        course_subject: "1",
        course_num: "1",
        section: "1",
        title: "1",
        location: "1",
        enrollment_cap: "1",
        waitlist_cap: "1"
    }

    const defaultProperties: ClassProperty = {
        // object_id: {} as ObjectId,
        _id: "",
        class_status: "1",
        start_time: "1",
        end_time: "1",
        room: "1",
        facility_id: "1",
        days: ["Mon"],
        start_date: "t",
        end_date: "t",
        instructor_email: "t",
        instructor_name: "t",
        total_enrolled: "t",
        total_waitlisted: "t",
        tags: ["1", "2"]
    }

    const defaultCombined: CombinedClass = { classData: defaultClass, classProperties: defaultProperties };

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
                        <option value="Tues">Tuesday</option>
                        <option value="Wed">Wednesday</option>
                        <option value="Thurs">Thursday</option>
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

