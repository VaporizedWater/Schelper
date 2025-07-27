"use client";

import { useRouter } from "next/navigation";
import { ClassData, ClassProperty, tagType } from "@/lib/types";
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

    const [classInfo, setClassInfo] = useLocalStorage<ClassData>("classInfo", {
        // title: '',
        // catalog_num: '',
        // class_num: '',
        // session: '',
        course_subject: '',
        course_num: '',
        section: '',
        // enrollment_cap: '',
        // waitlist_cap: ''
    } as ClassData, { initializeWithValue: false });

    const [classProperties, setClassProperties] = useLocalStorage<ClassProperty>("classProperties", {
        days: ["Mon"],
        class_status: '',
        facility_id: '',
        room: '',
        instructor_email: '',
        instructor_name: '',
        cohort: '',
    } as ClassProperty, { initializeWithValue: false });

    const [selectedTags, setSelectedTags, clearSelectedTags] = useLocalStorage<tagType[]>("selectedTags", [], { initializeWithValue: false });
    const { tagList, uploadNewClasses } = useCalendarContext();

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
        } as ClassData);
        setClassProperties({
            days: ["Mon"],
            class_status: '',
            facility_id: '',
            room: '',
            instructor_email: '',
            instructor_name: '',
            cohort: '',
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

        // Display success message
        alert("Class created successfully: " + defaultCombined.data.title);

        // Navigate back (optional)
        router.back();
    };

    return (
        <div className="p-8 mx-auto text-black dark:text-gray-200" role="main" aria-labelledby="create-class-heading">
            <h2 id="create-class-heading" className="text-2xl font-semibold mb-6">
                Create New Class
            </h2>
            <div className="">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                    onReset={clearState}
                    aria-label="Create new class form"
                    autoComplete="off"
                >
                    {/* For class as well as class_property */}
                    <input
                        id="class-title"
                        type="text"
                        placeholder="Class Title"
                        value={title}
                        onChange={(e) => { setTitle(e.target.value); setClassInfo({ ...classInfo, title: e.target.value } as ClassData) }}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Class Title"
                        title="Class Title"
                        required
                    />

                    <div
                        className="flex flex-row gap-2 justify-around items-center p-2 border rounded-sm bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-500"
                        role="group"
                        aria-label="Select days of the week"
                    >
                        {ShortenedDays.map((dayOption) => (
                            <label key={dayOption} className="flex items-center gap-1 cursor-pointer dark:text-gray-200">
                                <input
                                    id={`day-checkbox-${dayOption}`}
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
                                    className="form-checkbox h-4 w-4 cursor-pointer transition-all appearance-none rounded-sm shadow-sm hover:shadow-md border border-slate-300 dark:border-zinc-400 checked:bg-blue-600 checked:border-blue-600 dark:checked:bg-blue-500"
                                    aria-checked={selectedDays.includes(dayOption)}
                                    aria-label={`Select ${dayOption}`}
                                    title={`Select ${dayOption}`}
                                />
                                <span>{dayOption}</span>
                            </label>
                        ))}
                    </div>

                    {/* Apply dark mode styling to all inputs */}
                    <input
                        id="start-time"
                        type="time"
                        value={startTime}
                        onChange={(e) => { setStartTime(e.target.value); setClassProperties({ ...classProperties, start_time: e.target.value } as ClassProperty) }}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Start Time"
                        title="Start Time"
                        required
                    />
                    <input
                        id="end-time"
                        type="time"
                        value={endTime}
                        onChange={(e) => { setEndTime(e.target.value); setClassProperties({ ...classProperties, end_time: e.target.value } as ClassProperty) }}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="End Time"
                        title="End Time"
                        required
                    />
                    <input
                        id="catalog-number"
                        type="number"
                        placeholder="Catalog Number"
                        value={classInfo.catalog_num || ''}
                        onChange={(e) => setClassInfo({ ...classInfo, catalog_num: e.target.value } as ClassData)}
                        onWheel={preventWheelChange}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Catalog Number"
                        title="Catalog Number"
                        inputMode="numeric"
                    />
                    <input
                        id="class-number"
                        type="number"
                        placeholder="Class Number"
                        value={classInfo.class_num || ''}
                        onChange={(e) => setClassInfo({ ...classInfo, class_num: e.target.value } as ClassData)}
                        onWheel={preventWheelChange}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Class Number"
                        title="Class Number"
                        inputMode="numeric"
                    />
                    <input
                        id="session"
                        type="number"
                        placeholder="Session"
                        value={classInfo.session || ''}
                        onChange={(e) => setClassInfo({ ...classInfo, session: e.target.value } as ClassData)}
                        onWheel={preventWheelChange}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Session"
                        title="Session"
                        inputMode="numeric"
                    />
                    <input
                        id="course-subject"
                        type="text"
                        placeholder="Course Subject"
                        value={classInfo.course_subject || ''}
                        onChange={(e) => setClassInfo({ ...classInfo, course_subject: e.target.value } as ClassData)}
                        onWheel={preventWheelChange}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Course Subject"
                        title="Course Subject"
                    />
                    <input
                        id="course-number"
                        type="text"
                        placeholder="Course Number"
                        value={classInfo.course_num}
                        onChange={(e) => setClassInfo({ ...classInfo, course_num: e.target.value } as ClassData)}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Course Number"
                        title="Course Number"
                    />
                    <input
                        id="section"
                        type="text"
                        placeholder="Section"
                        value={classInfo.section}
                        onChange={(e) => setClassInfo({ ...classInfo, section: e.target.value } as ClassData)}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Section"
                        title="Section"
                    />
                    <input
                        id="enrollment-capacity"
                        type="number"
                        placeholder="Enrollment Capacity"
                        value={classInfo.enrollment_cap || ''}
                        onChange={(e) => setClassInfo({ ...classInfo, enrollment_cap: e.target.value } as ClassData)}
                        onWheel={preventWheelChange}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Enrollment Capacity"
                        title="Enrollment Capacity"
                        inputMode="numeric"
                    />
                    <input
                        id="waitlist-capacity"
                        type="number"
                        placeholder="Waitlist Capacity"
                        value={classInfo.waitlist_cap || ''}
                        onChange={(e) => setClassInfo({ ...classInfo, waitlist_cap: e.target.value } as ClassData)}
                        onWheel={preventWheelChange}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Waitlist Capacity"
                        title="Waitlist Capacity"
                        inputMode="numeric"
                    />

                    {/*Other Class Properties: class status, facility id, room, instructor email, total enrolled, total waitlisted*/}
                    <div className="p-2" aria-label="Class Properties" id="class-properties-label">Class Properties</div>

                    <input
                        id="class-status"
                        type="text"
                        placeholder="Class Status"
                        value={classProperties.class_status}
                        onChange={(e) => setClassProperties({ ...classProperties, class_status: e.target.value } as ClassProperty)}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Class Status"
                        title="Class Status"
                    />
                    <input
                        id="facility-id"
                        type="text"
                        placeholder="Facility ID"
                        value={classProperties.facility_id}
                        onChange={(e) => setClassProperties({ ...classProperties, facility_id: e.target.value } as ClassProperty)}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Facility ID"
                        title="Facility ID"
                    />
                    <input
                        id="room"
                        type="text"
                        placeholder="Room"
                        value={classProperties.room}
                        onChange={(e) => setClassProperties({ ...classProperties, room: e.target.value } as ClassProperty)}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Room"
                        title="Room"
                    />

                    <input
                        id="instructor-email"
                        type="text"
                        placeholder="Instructor Email"
                        value={classProperties.instructor_email}
                        onChange={(e) => setClassProperties({ ...classProperties, instructor_email: e.target.value } as ClassProperty)}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Instructor Email"
                        title="Instructor Email"
                    />

                    <input
                        id="instructor-name"
                        type="text"
                        placeholder="Instructor Name"
                        value={classProperties.instructor_name}
                        onChange={(e) => setClassProperties({ ...classProperties, instructor_name: e.target.value } as ClassProperty)}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Instructor Name"
                        title="Instructor Name"
                    />

                    <input
                        id="total-enrolled"
                        type="number"
                        placeholder="Total Enrolled"
                        value={classProperties.total_enrolled || ''}
                        onChange={(e) => setClassProperties({ ...classProperties, total_enrolled: e.target.value } as ClassProperty)}
                        onWheel={preventWheelChange}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Total Enrolled"
                        title="Total Enrolled"
                        inputMode="numeric"
                    />

                    <input
                        id="total-waitlisted"
                        type="number"
                        placeholder="Total Waitlisted"
                        value={classProperties.total_waitlisted || ''}
                        onChange={(e) => setClassProperties({ ...classProperties, total_waitlisted: e.target.value } as ClassProperty)}
                        onWheel={preventWheelChange}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Total Waitlisted"
                        title="Total Waitlisted"
                        inputMode="numeric"
                    />

                    <input
                        id="cohort"
                        type="text"
                        placeholder="Cohort"
                        value={classProperties.cohort}
                        onChange={(e) => setClassProperties({ ...classProperties, cohort: e.target.value } as ClassProperty)}
                        className="p-2 border rounded-sm bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                        aria-label="Cohort"
                        title="Cohort"
                    />

                    {/* Display dropdown of tags that can be checked */}
                    <DropDown
                        buttonClassName="p-2 border rounded-sm w-full bg-white dark:bg-zinc-700 text-black dark:text-gray-200 border-gray-300 dark:border-zinc-500"
                        renderButton={(isOpen) => (
                            <div className="flex justify-between items-center cursor-pointer" aria-haspopup="listbox" aria-expanded={isOpen} aria-label="Select Tags" title="Select Tags">
                                <span id="select-tags-label">Select Tags ({selectedTags.length})</span>
                                {isOpen ? <MdExpandLess aria-hidden="true" /> : <MdExpandMore aria-hidden="true" />}
                            </div>
                        )}
                        renderDropdown={() => (
                            <div className="p-2 border rounded-sm flex flex-col gap-2 bg-white dark:bg-zinc-700 border-gray-300 dark:border-zinc-500" role="listbox" aria-labelledby="select-tags-label">
                                {[...tagList.keys()].map((tag) => (
                                    <label key={tag} className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200">
                                        <input
                                            id={`tag-checkbox-${tag}`}
                                            type="checkbox"
                                            checked={selectedTags.includes({ tagName: tag, tagCategory: tagList.get(tag)?.tagCategory } as tagType)}
                                            onChange={(e) => {
                                                let newTags: tagType[];
                                                if (e.target.checked) {
                                                    newTags = [...selectedTags, { tagName: tag, tagCategory: tagList.get(tag)?.tagCategory } as tagType];
                                                } else {
                                                    newTags = selectedTags.filter(t => t.tagName !== tag);
                                                }
                                                setSelectedTags(newTags);
                                                setClassProperties({
                                                    ...classProperties,
                                                    tags: newTags
                                                } as ClassProperty);
                                            }}
                                            className="h-4 w-4 rounded-sm border-gray-300 dark:border-zinc-400 text-blue-600 focus:ring-blue-500"
                                            aria-checked={selectedTags.some(t => t.tagName === tag)}
                                            aria-label={`Select tag ${tag}`}
                                            title={`Select tag ${tag}`}
                                        />
                                        <span>{tag}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        aria-label="Tag selection dropdown"
                        aria-labelledby="select-tags-label"
                    />

                    <div className="flex flex-row gap-2" aria-label="Form actions">
                        {/* Clear button */}
                        <button
                            type="reset"
                            className="bg-gray-300 dark:bg-zinc-600 text-black dark:text-gray-200 p-2 rounded-md hover:bg-gray-400 dark:hover:bg-zinc-500 transition-colors duration-150 grow"
                            aria-label="Clear form"
                            title="Clear form"
                        >
                            Clear
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 dark:bg-blue-600 text-white p-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-150 grow"
                            aria-label="Create class"
                            title="Create class"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewClassForm;