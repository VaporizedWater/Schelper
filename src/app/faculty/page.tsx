"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Faculty } from "@/lib/types";

const initialUnavailability: Faculty["unavailability"] = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
};

const FacultyForm = () => {
    const [name, setName] = useState("");
    const [unavailability, setUnavailability] = useState(initialUnavailability);
    const router = useRouter();

    const addTimeSlot = (day: keyof Faculty["unavailability"]) => {
        setUnavailability((prev) => ({
            ...prev,
            [day]: [...prev[day], { start: "", end: "" }],
        }));
    };

    const updateTimeSlot = (
        day: keyof Faculty["unavailability"],
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
        if (!name) {
            alert("Please enter a faculty name");
            return;
        }

        const payload: Faculty = { name, unavailability };

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

    const days: (keyof Faculty["unavailability"])[] = ["mon", "tue", "wed", "thu", "fri"];

    return (
        <div className="p-8 mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Create Faculty</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Faculty Name */}
                <input
                    type="text"
                    placeholder="Faculty Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="p-2 border rounded-sm"
                />

                {/* Unavailability for each day */}
                <div>
                    <h3 className="text-xl font-medium mb-2">Unavailability</h3>
                    {days.map((day) => (
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
                            setName("");
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
