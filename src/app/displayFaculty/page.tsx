"use client";

import { useEffect, useState } from "react";
import { FacultyType } from "@/lib/types";
import { MdDelete, MdExpandLess, MdExpandMore } from "react-icons/md";
import { LuUserRoundX } from "react-icons/lu";
import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import DropDown from "@/components/DropDown/DropDown";
import { EventInput } from '@fullcalendar/core';

const FacultyDisplayPage = () => {
    const { faculty, deleteFaculty, updateFaculty, isLoading: contextLoading } = useCalendarContext();
    const [facultyData, setFacultyData] = useState<FacultyType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDropdownEmail, setOpenDropdownEmail] = useState<string | null>(null);

    const [showAddSlot, setShowAddSlot] = useState<Record<
        string,
        Record<keyof FacultyType["unavailability"], boolean>
    >>({});

    useEffect(() => {
        const initial: typeof showAddSlot = {};
        facultyData.forEach(f => {
            initial[f.email] = {
                Mon: false,
                Tue: false,
                Wed: false,
                Thu: false,
                Fri: false
            };
        });
        setShowAddSlot(initial);
    }, [facultyData]);

    // draft new slots per faculty per day
    const [newSlotTimes, setNewSlotTimes] = useState<Record<
        string,
        Record<keyof FacultyType["unavailability"], { start: string; end: string }>
    >>({});

    useEffect(() => {
        // If faculty data has been loaded from context
        if (faculty) {
            setFacultyData(faculty);
            setIsLoading(false);
        } else if (!contextLoading) {
            // If context is no longer loading but we have no data
            setIsLoading(false);
        }
    }, [faculty, contextLoading]);

    // initialize empty drafts whenever facultyData changes
    useEffect(() => {
        const initShow: typeof showAddSlot = {};
        const initial: typeof newSlotTimes = {};
        facultyData.forEach(f => {
            initShow[f.email] = {
                Mon: false,
                Tue: false,
                Wed: false,
                Thu: false,
                Fri: false
            };
            initial[f.email] = {
                Mon: { start: "", end: "" },
                Tue: { start: "", end: "" },
                Wed: { start: "", end: "" },
                Thu: { start: "", end: "" },
                Fri: { start: "", end: "" },
            };
        });
        setShowAddSlot(initShow);
        setNewSlotTimes(initial);
    }, [facultyData]);

    const toggleAddSlot = (
        email: string,
        day: keyof FacultyType["unavailability"]
    ) => {
        setShowAddSlot(prev => ({
            ...prev,
            [email]: {
                ...prev[email],
                [day]: !prev[email][day],
            }
        }));
    };

    // update a draft time
    const handleNewSlotChange = (
        email: string,
        day: keyof FacultyType["unavailability"],
        field: "start" | "end",
        value: string
    ) => {
        setNewSlotTimes(prev => ({
            ...prev,
            [email]: {
                ...prev[email],
                [day]: {
                    ...prev[email][day],
                    [field]: value,
                }
            }
        }));
    };

    // add the new slot into context + local state
    const handleAddTimeSlot = async (
        email: string,
        day: keyof FacultyType["unavailability"]
    ) => {
        const { start, end } = newSlotTimes[email][day];
        if (!start || !end) return;

        const existing = facultyData.find(f => f.email === email);
        if (!existing) return;

        const modified: FacultyType = {
            ...existing,
            unavailability: {
                ...existing.unavailability,
                [day]: [
                    ...existing.unavailability[day],
                    { start, end }
                ]
            }
        };

        const others = facultyData.filter(f => f.email !== email);
        const success = await updateFaculty([...others, modified], true); // Merge with existing data
        if (success) {
            setFacultyData([...others, modified]);
            // clear the draft
            setNewSlotTimes(prev => ({
                ...prev,
                [email]: {
                    ...prev[email],
                    [day]: { start: "", end: "" }
                }
            }));
        } else {
            setError("Failed to add time slot");
        }
    };

    // Handler to delete an entire faculty record
    const handleDeleteFaculty = async (facultyEmail: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this faculty record?");
        if (!confirmed) return;

        try {
            const updatedFacultyData = facultyData.filter((faculty) => faculty.email !== facultyEmail);
            setFacultyData(updatedFacultyData);
            await deleteFaculty(facultyEmail);
        } catch (err) {
            setError("Failed to delete faculty member");
            console.error(err);
        }
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

        try {
            // Create updated faculty data
            const updatedFaculty = facultyData.find(f => f.email === facultyEmail);
            if (!updatedFaculty) {
                console.error("Faculty not found:", facultyEmail);
                return;
            }

            console.log("Original faculty data:", updatedFaculty);

            // Create a new faculty object with the time slot removed
            const modifiedFaculty = {
                ...updatedFaculty,
                unavailability: {
                    ...updatedFaculty.unavailability,
                    [day]: updatedFaculty.unavailability[day].filter(
                        (slot) => !(slot.start === start && slot.end === end)
                    ),
                },
            };

            console.log("Modified faculty data:", modifiedFaculty);

            const otherFaculty = facultyData.filter(f => f.email !== facultyEmail);

            // Update context (which updates db and merges data)
            const success = await updateFaculty([...otherFaculty, modifiedFaculty], false); // Do not merge with existing data

            if (success) {
                // Get the updated faculty data from the context instead of trying to update it ourselves
                const updatedFacultyFromContext = faculty.find(f => f.email === facultyEmail);

                if (updatedFacultyFromContext) {
                    setFacultyData(prev =>
                        prev.map(f => f.email === facultyEmail ? updatedFacultyFromContext : f)
                    );
                }
                console.log("Time slot removed successfully");
            } else {
                setError("Failed to update time slot");
            }
        } catch (err) {
            setError("Failed to update time slot");
            console.error(err);
        }
    };

    // Handler for dropdown toggle
    const handleDropdownToggle = (email: string, isCurrentlyOpen: boolean) => {
        // If this dropdown is already open, close it
        // Otherwise, open this one and close others
        setOpenDropdownEmail(isCurrentlyOpen ? null : email);
    };

    // If there's an error, display it
    if (error) {
        return (
            <div className="p-8 mx-auto">
                <div className="flex justify-center items-center h-40">
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 mx-auto bg-white dark:bg-white text-black dark:text-black">
            <div className="flex justify-center">
                <h1 className="text-2xl font-semibold mb-6">Faculty Unavailability</h1>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : facultyData.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                    <p className="text-lg text-gray-400">No Faculty Data Available</p>
                </div>
            ) : (
                facultyData
                    .sort((a, b) => a.email.localeCompare(b.email))
                    .map((faculty) => (
                        <div key={faculty.email} className="py-2">
                            <div className="bg-gray-100">
                                {/* Using the DropDown component */}
                                <DropDown
                                    buttonClassName="w-full"
                                    dropdownClassName="relative mt-0 shadow-none"
                                    alwaysOpen={openDropdownEmail === faculty.email}
                                    renderButton={(isOpen) => (
                                        <div
                                            className="hover:bg-grayblue flex justify-between items-center p-2 bg-gray-100 rounded-sm cursor-pointer"
                                            onClick={() => handleDropdownToggle(faculty.email, isOpen)}
                                        >
                                            <h2 className="font-medium">{faculty.email}</h2>

                                            <div className="flex items-center gap-2">
                                                <div className="px-2 text-red-500 hover:bg-gray-300 p-1 rounded-sm cursor-pointer" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteFaculty(faculty.email)
                                                }}>
                                                    <LuUserRoundX size={18} />
                                                </div>
                                                {isOpen ? <MdExpandLess /> : <MdExpandMore />}
                                            </div>
                                        </div>
                                    )}
                                    renderDropdown={() => (
                                        <div className="grid grid-cols-5 gap-4 w-full -mt-2 p-3 bg-white">
                                            {(Object.entries(faculty.unavailability) as [keyof FacultyType["unavailability"], EventInput[]][]).map(([day, slots]) => (
                                                <div key={day}>
                                                    <div className="flex justify-between items-center py-2">
                                                        <h3 className="capitalize font-semibold">{day}</h3>
                                                        <button
                                                            onClick={() => toggleAddSlot(faculty.email, day)}
                                                            className={`font-bold ${showAddSlot[faculty.email]?.[day] ? "text-red-600" : "text-blue-600"}`}
                                                        >
                                                            {showAddSlot[faculty.email]?.[day] ? '–' : '+'}
                                                        </button>
                                                    </div>

                                                    {slots.length > 0 ? (
                                                        slots.map((slot, index) => (
                                                            <div key={index} className="py-1 flex flex-row items-center">
                                                                <div>
                                                                    {slot.start as string || "-"} to {slot.end as string || "-"}
                                                                </div>
                                                                <button
                                                                    onClick={() => handleRemoveTimeSlot(
                                                                        faculty.email!,
                                                                        day,
                                                                        slot.start as string,
                                                                        slot.end as string
                                                                    )}
                                                                    className="text-red-500"
                                                                >
                                                                    <MdDelete size={20} />
                                                                </button>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-gray-400">-</div>
                                                    )}

                                                    {showAddSlot[faculty.email]?.[day] && (
                                                        <div className="mt-2">
                                                            <div className="flex flex-col gap-2 mt-2">
                                                                <input
                                                                    type="time"
                                                                    value={newSlotTimes[faculty.email!]?.[day]?.start || ""}
                                                                    onChange={e => handleNewSlotChange(faculty.email!, day, "start", e.target.value)}
                                                                    className="p-1 border rounded-sm"
                                                                />
                                                                <span>to</span>
                                                                <input
                                                                    type="time"
                                                                    value={newSlotTimes[faculty.email!]?.[day]?.end || ""}
                                                                    onChange={e => handleNewSlotChange(faculty.email!, day, "end", e.target.value)}
                                                                    className="p-1 border rounded-sm"
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => handleAddTimeSlot(faculty.email!, day)}
                                                                className="text-green-600 ml-2"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    ))
            )}
        </div>
    );
};

export default FacultyDisplayPage;