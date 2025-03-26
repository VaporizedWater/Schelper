"use client";

import { useRouter } from "next/navigation";
import { Class, ClassProperty } from "@/lib/types";
import { useLocalStorage } from 'usehooks-ts'
import DropDown from "@/components/DropDown/DropDown";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import { newDefaultEmptyClass, ShortenedDays } from "@/lib/common";

// Add this helper function before the component
const preventWheelChange = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
};

const NewClassForm = () => {
    const [title, setTitle, clearTitle] = useLocalStorage("title", "", { initializeWithValue: false });
    const [, , clearDay] = useLocalStorage("day", "Mon", { initializeWithValue: false });
    const [selectedDays, setSelectedDays, clearSelectedDays] = useLocalStorage<string[]>("selectedDays", ["Mon"], { initializeWithValue: false });
    const [startTime, setStartTime, clearStartTime] = useLocalStorage("startTime", "", { initializeWithValue: false });
    const [endTime, setEndTime, clearEndTime] = useLocalStorage("endTime", "", { initializeWithValue: false });

    const [classInfo, setClassInfo] = useLocalStorage<Class>("classInfo", {
        // title: '',
        // catalog_num: '',
        // class_num: '',
        // session: '',
        course_subject: '',
        course_num: '',
        section: '',
        location: '',
        // enrollment_cap: '',
        // waitlist_cap: ''
    } as Class, { initializeWithValue: false });

    const [classProperties, setClassProperties] = useLocalStorage<ClassProperty>("classProperties", {
        days: ["Mon"],
        class_status: '',
        facility_id: '',
        room: '',
    } as ClassProperty, { initializeWithValue: false });

    const [selectedTags, setSelectedTags, clearSelectedTags] = useLocalStorage<string[]>("selectedTags", [], { initializeWithValue: false });
    const { allTags, uploadNewClasses } = useCalendarContext();

    const router = useRouter();

    const clearState = () => {
        clearTitle();
        clearDay();
        clearSelectedDays();
        clearStartTime();
        clearEndTime();
        setClassInfo({
            course_subject: '',
            course_num: '',
            section: '',
            location: '',
        } as Class);
        setClassProperties({
            days: ["Mon"],
            class_status: '',
            facility_id: '',
            room: '',
        } as ClassProperty);
        clearSelectedTags();
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !selectedDays.length || !startTime || !endTime) {
            alert("Please fill out all fields");
            return;
        }

        // Blank tags for now by default until we take them as input
        setClassProperties({ ...classProperties, tags: [] } as ClassProperty);

        const defaultCombined = newDefaultEmptyClass();

        // Testing POST Request
        if (classInfo) {
            defaultCombined.data = {
                ...defaultCombined.data,
                ...classInfo
            };
        }

        if (classProperties) {
            defaultCombined.properties = {
                ...defaultCombined.properties,
                ...classProperties,
                // Preserve special handling for arrays
                days: classProperties.days?.length > 0
                    ? classProperties.days
                    : ["Mon"],
                tags: classProperties.tags?.length > 0
                    ? classProperties.tags
                    : defaultCombined.properties.tags
            };
        }
        // Update the context as well
        uploadNewClasses([defaultCombined]);

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
                        className="p-2 border rounded-sm"
                    />

                    <div className="flex flex-row gap-2 justify-around items-center p-2 border rounded-sm">
                        {ShortenedDays.map((dayOption) => (
                            <label key={dayOption} className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedDays.includes(dayOption)}
                                    onChange={(e) => {
                                        const newDays = e.target.checked
                                            ? [...selectedDays, dayOption]
                                            : selectedDays.filter(d => d !== dayOption);

                                        setSelectedDays(newDays);
                                        setClassProperties({
                                            ...classProperties,
                                            days: newDays
                                        } as ClassProperty);
                                    }}
                                    className="form-checkbox h-4 w-4 cursor-pointer transition-all appearance-none rounded-sm shadow-sm hover:shadow-md border border-slate-300 checked:bg-blue-600 checked:border-blue-600"
                                />
                                <span>{dayOption}</span>
                            </label>
                        ))}
                    </div>

                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => { setStartTime(e.target.value); setClassProperties({ ...classProperties, start_time: e.target.value } as ClassProperty) }}
                        className="p-2 border rounded-sm"
                    />
                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => { setEndTime(e.target.value); setClassProperties({ ...classProperties, end_time: e.target.value } as ClassProperty) }}
                        className="p-2 border rounded-sm"
                    />
                    <input
                        type="number"
                        placeholder="Catalog Number"
                        value={classInfo.catalog_num || ''}
                        onChange={(e) => setClassInfo({ ...classInfo, catalog_num: e.target.value } as Class)}
                        onWheel={preventWheelChange}
                        className="p-2 border rounded-sm"
                    />
                    <input
                        type="number"
                        placeholder="Class Number"
                        value={classInfo.class_num || ''}
                        onChange={(e) => setClassInfo({ ...classInfo, class_num: e.target.value } as Class)}
                        onWheel={preventWheelChange}
                        className="p-2 border rounded-sm"
                    />
                    <input
                        type="number"
                        placeholder="Session"
                        value={classInfo.session || ''}
                        onChange={(e) => setClassInfo({ ...classInfo, session: e.target.value } as Class)}
                        onWheel={preventWheelChange}
                        className="p-2 border rounded-sm"
                    />
                    <input
                        type="text"
                        placeholder="Course Subject"
                        value={classInfo.course_subject || ''}
                        onChange={(e) => setClassInfo({ ...classInfo, course_subject: e.target.value } as Class)}
                        onWheel={preventWheelChange}
                        className="p-2 border rounded-sm"
                    />
                    <input
                        type="text"
                        placeholder="Course Number"
                        value={classInfo.course_num}
                        onChange={(e) => setClassInfo({ ...classInfo, course_num: e.target.value } as Class)}
                        className="p-2 border rounded-sm"
                    />
                    <input
                        type="text"
                        placeholder="Section"
                        value={classInfo.section}
                        onChange={(e) => setClassInfo({ ...classInfo, section: e.target.value } as Class)}
                        className="p-2 border rounded-sm"
                    />
                    <input
                        type="text"
                        placeholder="Location"
                        value={classInfo.location}
                        onChange={(e) => setClassInfo({ ...classInfo, location: e.target.value } as Class)}
                        className="p-2 border rounded-sm"
                    />
                    <input
                        type="number"
                        placeholder="Enrollment Capacity"
                        value={classInfo.enrollment_cap || ''}
                        onChange={(e) => setClassInfo({ ...classInfo, enrollment_cap: e.target.value } as Class)}
                        onWheel={preventWheelChange}
                        className="p-2 border rounded-sm"
                    />
                    <input
                        type="number"
                        placeholder="Waitlist Capacity"
                        value={classInfo.waitlist_cap || ''}
                        onChange={(e) => setClassInfo({ ...classInfo, waitlist_cap: e.target.value } as Class)}
                        onWheel={preventWheelChange}
                        className="p-2 border rounded-sm"
                    />

                    {/*Other Class Properties: class status, facility id, room, instructor email, total enrolled, total waitlisted*/}
                    <div className="p-2">Class Properties</div>

                    <input
                        type="text"
                        placeholder="Class Status"
                        value={classProperties.class_status}
                        onChange={(e) => setClassProperties({ ...classProperties, class_status: e.target.value } as ClassProperty)}
                        className="p-2 border rounded-sm"
                    />
                    <input
                        type="text"
                        placeholder="Facility ID"
                        value={classProperties.facility_id}
                        onChange={(e) => setClassProperties({ ...classProperties, facility_id: e.target.value } as ClassProperty)}
                        className="p-2 border rounded-sm"
                    />
                    <input
                        type="text"
                        placeholder="Room"
                        value={classProperties.room}
                        onChange={(e) => setClassProperties({ ...classProperties, room: e.target.value } as ClassProperty)}
                        className="p-2 border rounded-sm"
                    />

                    <input
                        type="text"
                        placeholder="Instructor Email"
                        value={classProperties.instructor_email}
                        onChange={(e) => setClassProperties({ ...classProperties, instructor_email: e.target.value } as ClassProperty)}
                        className="p-2 border rounded-sm"
                    />

                    <input
                        type="text"
                        placeholder="Instructor Name"
                        value={classProperties.instructor_name}
                        onChange={(e) => setClassProperties({ ...classProperties, instructor_name: e.target.value } as ClassProperty)}
                        className="p-2 border rounded-sm"
                    />

                    <input
                        type="number"
                        placeholder="Total Enrolled"
                        value={classProperties.total_enrolled || ''}
                        onChange={(e) => setClassProperties({ ...classProperties, total_enrolled: e.target.value } as ClassProperty)}
                        onWheel={preventWheelChange}
                        className="p-2 border rounded-sm"
                    />

                    <input
                        type="number"
                        placeholder="Total Waitlisted"
                        value={classProperties.total_waitlisted || ''}
                        onChange={(e) => setClassProperties({ ...classProperties, total_waitlisted: e.target.value } as ClassProperty)}
                        onWheel={preventWheelChange}
                        className="p-2 border rounded-sm"
                    />

                    {/* Display dropdown of tags that can be checked */}
                    <DropDown
                        buttonClassName="p-2 border rounded-sm w-full"
                        renderButton={(isOpen) => (
                            <div className="flex justify-between items-center cursor-pointer">
                                <span>Select Tags ({selectedTags.length})</span>
                                {isOpen ? <MdExpandLess /> : <MdExpandMore />}
                            </div>
                        )}
                        renderDropdown={() => (
                            <div className="p-2 border rounded-sm flex flex-col gap-2">
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
                                            className="h-4 w-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">{tag}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    />

                    <div className="flex flex-row gap-2">
                        {/* Clear button */}
                        <button type="reset" className="bg-gray-300 text-black p-2 rounded-sm grow">
                            Clear
                        </button>
                        <button type="submit" className="bg-blue-500 text-white p-2 rounded-sm grow">
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewClassForm;