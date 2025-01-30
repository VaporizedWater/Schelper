"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FullCalendarClassEvent } from "@/lib/types";

const NewClassModal = () => {
    const [title, setTitle] = useState("");
    const [day, setDay] = useState("Mon");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const router = useRouter();

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

        // Close modal
        router.back();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-semibold mb-4">Create New Class</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input 
                        type="text" 
                        placeholder="Class Title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        className="p-2 border rounded"
                    />
                    <select 
                        value={day} 
                        onChange={(e) => setDay(e.target.value)} 
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
                        onChange={(e) => setStartTime(e.target.value)} 
                        className="p-2 border rounded"
                    />
                    <input 
                        type="time" 
                        value={endTime} 
                        onChange={(e) => setEndTime(e.target.value)} 
                        className="p-2 border rounded"
                    />
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded">Create</button>
                </form>
            </div>
        </div>
    );
};

export default NewClassModal;
