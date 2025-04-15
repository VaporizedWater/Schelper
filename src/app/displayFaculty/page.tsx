"use client";

import { useEffect, useState } from "react";
import { Faculty } from "@/lib/types";
import { IoBan } from "react-icons/io5";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { LuUserRoundX } from "react-icons/lu";

const FacultyDisplayPage = () => {
    const [facultyData, setFacultyData] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // State to keep track of which faculties are expanded (dropdown)
    const [expandedFaculty, setExpandedFaculty] = useState<string[]>([]);

    useEffect(() => {
        const fetchFacultyData = async () => {
            try {
                const response = await fetch("/api/faculty");
                if (!response.ok) throw new Error("Error fetching faculty data");
                const data: Faculty[] = await response.json();
                setFacultyData(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchFacultyData();
    }, []);

    // Handler to toggle the dropdown for a faculty
    const toggleFaculty = (facultyId: string) => {
        setExpandedFaculty((prev) =>
            prev.includes(facultyId)
                ? prev.filter((id) => id !== facultyId)
                : [...prev, facultyId]
        );
    };

    // Handler to delete an entire faculty record.
    const handleDeleteFaculty = async (facultyId: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this faculty record?");
        if (!confirmed) return;

        const response = await fetch("/api/faculty", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ facultyId }),
        });
        if (response.ok) {
            setFacultyData((prev) => prev.filter((faculty) => faculty._id !== facultyId));
            // Also remove from the expanded list in case it was open
            setExpandedFaculty((prev) => prev.filter((id) => id !== facultyId));
        } else {
            alert("Error deleting faculty");
        }
    };

    // Handler to delete a specific time slot for a given day.
    const handleDeleteTimeSlot = async (
        facultyId: string,
        day: keyof Faculty["unavailability"],
        start: string,
        end: string
    ) => {
        const confirmed = window.confirm(`Delete time slot ${start} - ${end} on ${day}?`);
        if (!confirmed) return;

        const response = await fetch("/api/faculty", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ facultyId, day, start, end }),
        });
        if (response.ok) {
            // Update the state to remove the deleted time slot.
            setFacultyData((prev) =>
                prev.map((faculty) => {
                    if (faculty._id === facultyId) {
                        return {
                            ...faculty,
                            unavailability: {
                                ...faculty.unavailability,
                                [day]: faculty.unavailability[day].filter(
                                    (slot) => !(slot.start === start && slot.end === end)
                                ),
                            },
                        };
                    }
                    return faculty;
                })
            );
        } else {
            alert("Error deleting time slot");
        }
    };

    if (loading) return <div className="p-4">Loading faculty data...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="p-8 mx-auto">
            <div className="flex justify-center">
                <h1 className="text-4xl font-semibold mb-6">Faculty Unavailability</h1>
            </div>
            {facultyData.map((faculty) => (
                <div key={faculty._id} className="mb-6 border-b pb-4">
                    <div className="flex justify-between items-center bg-psublue">
                        {/* Clickable area to toggle dropdown */}
                        <div
                            className="cursor-pointer"
                            onClick={() => toggleFaculty(faculty._id!)}
                        >
                            <h2 className="text-xl font-medium mb-2">{faculty.name}</h2>
                            <div className="flex items-center space-x-2">
                                <h2 className="text-xl font-medium">{faculty.email}</h2>
                                <span className="text-xl">
                                    {expandedFaculty.includes(faculty._id!)
                                        ? <MdExpandLess />
                                        : <MdExpandMore />
                                    }
                                </span>
                            </div>

                        </div>
                        {/* Delete Faculty Button */}
                        <button onClick={() => handleDeleteFaculty(faculty._id!)} className="flex items-center space-x-2 text-red-500">
                            <LuUserRoundX size="1.5em" />
                        </button>
                    </div>
                    {/* Render dropdown content if expanded */}
                    {expandedFaculty.includes(faculty._id!) && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {(Object.entries(faculty.unavailability) as [keyof Faculty["unavailability"], { start: string; end: string }[]][]).map(([day, slots]) => (
                                <div key={day}>
                                    <h3 className="capitalize font-semibold underline mb-2">{day}</h3>
                                    {slots.length > 0 ? (
                                        slots.map((slot: { start: string; end: string }, index: number) => (
                                            <div key={index} className="mb-1 flex justify-between items-center">
                                                <span>
                                                    {slot.start || "–"} to {slot.end || "–"}
                                                </span>
                                                <button onClick={() => handleDeleteTimeSlot(faculty._id!, day, slot.start, slot.end)} className="flex items-center space-x-2 text-red-500 ml-2">
                                                    <IoBan size="1em" />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-gray-400">No unavailability</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FacultyDisplayPage;
