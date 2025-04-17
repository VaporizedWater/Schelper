"use client";

import { useEffect, useState } from "react";
import { FacultyType } from "@/lib/types";
import { MdDelete, MdExpandLess, MdExpandMore } from "react-icons/md";
import { LuUserRoundX } from "react-icons/lu";
import { deleteStoredFaculty, updateFaculty } from "@/lib/DatabaseUtils";

const FacultyDisplayPage = () => {
    const [facultyData, setFacultyData] = useState<FacultyType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // State to keep track of which faculties are expanded (dropdown)
    const [expandedFaculty, setExpandedFaculty] = useState<string[]>([]);

    useEffect(() => {
        const fetchFacultyData = async () => {
            try {
                const response = await fetch("/api/faculty");
                if (!response.ok) throw new Error("Error fetching faculty data");
                const data: FacultyType[] = await response.json();
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
    const handleDeleteFaculty = async (facultyEmail: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this faculty record?");
        if (!confirmed) return;

        const updatedFacultyData = facultyData.filter((faculty) => faculty.email !== facultyEmail);
        setFacultyData(updatedFacultyData);

        // Delete using deleteStoredFaculty function
        deleteStoredFaculty(facultyEmail).then((success) => {
            if (success) {
                alert("Faculty deleted successfully!");
            } else {
                alert("Error deleting faculty");
            }
        });
    };

    // Handler to remove a specific time slot for a given day.
    const handleRemoveTimeSlot = async (
        facultyEmail: string,
        day: keyof FacultyType["unavailability"],
        start: string,
        end: string
    ) => {
        const confirmed = window.confirm(`Remove time slot ${start} - ${end} on ${day}?`);
        if (!confirmed) return;


        // Update the state to remove the time slot.
        setFacultyData((prev) =>
            prev.map((faculty) => {
                if (faculty._id === facultyEmail) {
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

        // Update database
        updateFaculty(facultyData).then((success) => {
            if (success) {
                alert("Time slot removed successfully!");
            } else {
                alert("Error removing time slot");
            }
        });

    };

    if (loading) return <div className="p-4">Loading faculty data...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="p-8 mx-auto">
            <div className="flex justify-center">
                <h1 className="text-2xl font-semibold mb-6">Faculty Unavailability</h1>
            </div>
            {facultyData.map((faculty) => (
                <div key={faculty._id} className="mb-6 border-b pb-4">
                    <div className="flex justify-between items-center bg-gray-100">
                        {/* Clickable area to toggle dropdown */}
                        <div
                            className="cursor-pointer"
                            onClick={() => toggleFaculty(faculty._id!)}
                        >
                            <h2 className="font-medium mb-2">{faculty.email /*This was name, but my type doesnt track that because we never needed it*/}</h2>
                            <div className="flex items-center space-x-2">
                                <h2 className="font-medium">{faculty.email}</h2>
                                <span className="">
                                    {expandedFaculty.includes(faculty._id!)
                                        ? <MdExpandLess />
                                        : <MdExpandMore />
                                    }
                                </span>
                            </div>

                        </div>
                        {/* Delete Faculty Button */}
                        <button onClick={() => handleDeleteFaculty(faculty.email)} className="flex items-center px-2 text-red-500">
                            <LuUserRoundX size={18} />
                        </button>
                    </div>
                    {/* Render dropdown content if expanded */}
                    {expandedFaculty.includes(faculty._id!) && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {(Object.entries(faculty.unavailability) as [keyof FacultyType["unavailability"], { start: string; end: string }[]][]).map(([day, slots]) => (
                                <div key={day}>
                                    <h3 className="capitalize font-semibold py-2">{day}</h3>
                                    {slots.length > 0 ? (
                                        slots.map((slot: { start: string; end: string }, index: number) => (
                                            <div key={index} className="py-1 flex flex-row items-center">
                                                <div>
                                                    {slot.start || "-"} to {slot.end || "-"}
                                                </div>
                                                <button onClick={() => handleRemoveTimeSlot(faculty._id!, day, slot.start, slot.end)} className=" text-red-500">
                                                    <MdDelete size={20} />
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