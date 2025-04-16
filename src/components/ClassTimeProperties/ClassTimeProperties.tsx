import { ClassProperty, CombinedClass } from "@/lib/types";
import { useCalendarContext } from "../CalendarContext/CalendarContext";
import { useEffect, useState } from "react";
import { createEventsFromCombinedClass, newDefaultEmptyClass, ShortenedDays } from "@/lib/common";

const ClassTimeProperties = () => {
    const { currentCombinedClass, updateOneClass } = useCalendarContext();
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

    const handleDaysChange = (day: string, isChecked: boolean) => {
        const updatedDays = isChecked
            ? [...days, day]
            : days.filter(d => d !== day);

        setDays(updatedDays);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.days = updatedDays;
            updateOneClass(modifiedClass);
        }
    };

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setStartTime(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.start_time = newVal;
            modifiedClass.events = createEventsFromCombinedClass(modifiedClass);
            updateOneClass(modifiedClass);
        }
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setEndTime(newVal);
        if (currentCombinedClass) {
            const modifiedClass: CombinedClass = currentCombinedClass || newDefaultEmptyClass();
            modifiedClass.properties.end_time = newVal;
            modifiedClass.events = createEventsFromCombinedClass(modifiedClass);
            updateOneClass(modifiedClass);
        }
    };

    return (
        <div className="h-full w-full">
            {currentCombinedClass?._id ? (
                <div>
                    <div className="font-bold py-2">Time Properties</div>
                    <ul className="flex flex-col w-full py-1">
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50">
                            <span className='w-full text-start font-semibold'>Start Time</span>
                            <input
                                type="time"
                                className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                                value={startTime}
                                onChange={handleStartTimeChange}
                            />
                        </li>
                        <li className="flex flex-col py-1 px-2 items-center focus-within:bg-blue-50">
                            <span className='w-full text-start font-semibold'>End Time</span>
                            <input
                                type="time"
                                className="flex-1 hover:border-gray-200 border-transparent border pl-1 w-full"
                                value={endTime}
                                onChange={handleEndTimeChange}
                            />
                        </li>
                        {/* Days Section */}
                        <li className="flex flex-col py-1 px-2 focus-within:bg-blue-50">
                            <div className="font-bold text-gray-700 min-w-20 flex flex-row items-center justify-between">
                                Days
                            </div>
                            <div>
                                <div className="flex-1 flex flex-col py-1 pl-1">
                                    {ShortenedDays.map(day => (
                                        <label key={day} className="flex items-center gap-1">
                                            <input
                                                type="checkbox"
                                                checked={days.includes(day)}
                                                onChange={(e) => handleDaysChange(day, e.target.checked)}
                                                className="form-checkbox h-4 w-4 cursor-pointer transition-all appearance-none rounded-sm shadow-sm hover:shadow-md border border-slate-300 checked:bg-blue-600 checked:border-ylue-600"
                                            />
                                            <span>{day}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            ) : (
                <div className="flex items-center justify-center text-center h-full text-gray-400 pb-8">
                    <p>Select a class to edit</p>
                </div>
            )}

        </div>
    )
}

export default ClassTimeProperties;