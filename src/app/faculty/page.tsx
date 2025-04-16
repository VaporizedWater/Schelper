"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FacultyType } from "@/lib/types";
import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import { ShortenedDays } from "@/lib/common";

// const initialUnavailability: Faculty["unavailability"] = {
//     mon: [],
//     tue: [],
//     wed: [],
//     thu: [],
//     fri: [],
// };

const FacultyForm = () => {
    const [email, setEmail] = useState("");
    const router = useRouter();
    const { faculty, updateFaculty, deleteFaculty } = useCalendarContext();

    const addTimeSlot = (day: keyof FacultyType["unavailability"]) => {
        
    };

    const updateTimeSlot = (
        day: keyof FacultyType["unavailability"],
        index: number,
        field: "start" | "end",
        value: string
    ) => {
        setUnavailability((prev) => {
            const updatedSlots = prev[day].map((slot, i) =>
                i === index ? { ...slot, [field]: value } : slot
            );
            return { ...prev, [day]: updatedSlots };
        });
    };

    const removeTimeSlot = (day: keyof Faculty["unavailability"], index: number) => {
        setUnavailability((prev) => {
            const updatedSlots = prev[day].filter((_, i) => i !== index);
            return { ...prev, [day]: updatedSlots };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            alert("Please enter a faculty member's email");
            return;
        }



        const payload: FacultyType = { email, unavailability };

        const response = await fetch("/api/faculty", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            alert("Faculty saved successfully!");
            router.back();
        } else {
            alert("Error saving faculty");
        }
    };

    return (
        <div className="p-8 mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Manage Faculty Availability</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Faculty Name */}
                <input
                    type="text"
                    placeholder="Faculty Name"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-2 border rounded-sm"
                />

                {/* Unavailability for each day */}
                <div>
                    <h3 className="text-xl font-medium mb-2">Unavailability</h3>
                    {ShortenedDays.map((day) => (
                        <div key={day} className="mb-4">
                            <h4 className="capitalize font-semibold">{day}</h4>
                            {unavailability[day].map((slot, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <input
                                        type="time"
                                        value={slot.start}
                                        onChange={(e) => updateTimeSlot(day, index, "start", e.target.value)}
                                        className="p-2 border rounded-sm"
                                    />
                                    <span>to</span>
                                    <input
                                        type="time"
                                        value={slot.end}
                                        onChange={(e) => updateTimeSlot(day, index, "end", e.target.value)}
                                        className="p-2 border rounded-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeTimeSlot(day, index)}
                                        className="text-red-500"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addTimeSlot(day)}
                                className="bg-gray-300 text-black p-2 rounded-sm"
                            >
                                Add Time Slot
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex flex-row gap-2">
                    <button
                        type="reset"
                        onClick={() => {
                            setEmail("");
                            setUnavailability(initialUnavailability);
                        }}
                        className="bg-gray-300 text-black p-2 rounded-sm grow"
                    >
                        Clear
                    </button>
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded-sm grow">
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FacultyForm;
