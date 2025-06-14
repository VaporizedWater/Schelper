import { ClassProperty, CombinedClass } from "@/lib/types";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { useCallback, useEffect, useState } from "react";
import { createEventsFromCombinedClass, newDefaultEmptyClass, ShortenedDays } from "@/lib/common";

const ClassTimeProperties = () => {
    const { currentCombinedClass, updateOneClass, toggleConflictPropertyChanged } = useCalendarContext();
    const initialProps: ClassProperty = currentCombinedClass?.properties || {} as ClassProperty;
    const [days, setDays] = useState<string[]>(initialProps.days || []);
    const [startTime, setStartTime] = useState(initialProps.start_time || '');
    const [endTime, setEndTime] = useState(initialProps.end_time || '');

    useEffect(() => {
        if (currentCombinedClass) {
            const newProps = currentCombinedClass.properties;

            setDays(newProps.days || []);

            setStartTime(newProps.start_time || '');
            setEndTime(newProps.end_time || '');
        }
    }, [currentCombinedClass]);

    const handleDaysChange = useCallback((day: string, isChecked: boolean) => {
        const updatedDays = isChecked
            ? [...days, day]
            : days.filter(d => d !== day);

        setDays(updatedDays);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.days = updatedDays;
            updateOneClass(modifiedClass);
            toggleConflictPropertyChanged();
        }
    }, [currentCombinedClass, days, toggleConflictPropertyChanged, updateOneClass]);

    const handleStartTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        // const oldVal = startTime;
        const newVal = e.target.value;
        // const diffTime = Number(newVal) - Number(oldVal);

        setStartTime(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.start_time = newVal;
            // modifiedClass.properties.end_time += diffTime;
            modifiedClass.events = createEventsFromCombinedClass(modifiedClass);
            updateOneClass(modifiedClass);
            toggleConflictPropertyChanged();
        }
    }, [currentCombinedClass, toggleConflictPropertyChanged, updateOneClass]);

    const handleEndTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setEndTime(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.end_time = newVal;
            modifiedClass.events = createEventsFromCombinedClass(modifiedClass);
            updateOneClass(modifiedClass);
            toggleConflictPropertyChanged();
        }
    }, [currentCombinedClass, toggleConflictPropertyChanged, updateOneClass]);

    return (
        <div
            id="time-properties-panel"
            className="h-full w-full flex flex-col"
            role="region"
            aria-labelledby="time-properties-title"
        >
            <div
                id="time-properties-title"
                className="w-full text-left py-2 font-bold text-gray-700 dark:text-gray-300"
            >
                Time Properties
            </div>
            <div className="h-full">
                {currentCombinedClass?._id ? (
                    <ul className="flex flex-col w-full" role="group" aria-label="Edit time properties">
                        {/* Start Time */}
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <label htmlFor="start-time" className="w-full text-start font-semibold">
                                Start Time
                            </label>
                            <input
                                id="start-time"
                                name="startTime"
                                type="time"
                                className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={startTime}
                                onChange={handleStartTimeChange}
                                aria-required="true"
                            />
                        </li>

                        {/* End Time */}
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <label htmlFor="end-time" className="w-full text-start font-semibold">
                                End Time
                            </label>
                            <input
                                id="end-time"
                                name="endTime"
                                type="time"
                                className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full bg-white dark:bg-zinc-800 text-black dark:text-gray-300 rounded"
                                value={endTime}
                                onChange={handleEndTimeChange}
                                aria-required="true"
                            />
                        </li>

                        {/* Days */}
                        <li className="flex flex-col py-1 px-2 focus-within:bg-blue-50 dark:focus-within:bg-gray-500/50 rounded">
                            <fieldset
                                id="days-fieldset"
                                className="w-full"
                                aria-required="true"
                            >
                                <legend className="font-bold text-gray-700 dark:text-gray-300">
                                    Days
                                </legend>
                                <div className="flex flex-col gap-2 mt-1">
                                    {ShortenedDays.map(day => (
                                        <label key={day} htmlFor={`day-${day}`} className="flex items-center gap-1">
                                            <input
                                                id={`day-${day}`}
                                                name="days"
                                                type="checkbox"
                                                value={day}
                                                checked={days.includes(day)}
                                                onChange={e => handleDaysChange(day, e.target.checked)}
                                                className="form-checkbox h-4 w-4 cursor-pointer rounded-sm transition-shadow border border-slate-300 checked:bg-blue-600 checked:border-blue-600"
                                            />
                                            <span>{day}</span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        </li>
                    </ul>
                ) : (
                    <div
                        className="flex items-center justify-center text-center h-full text-gray-400 pb-8"
                        role="alert"
                    >
                        <p>Select a class to edit</p>
                    </div>
                )}
            </div>
        </div>
    )

}

export default ClassTimeProperties;