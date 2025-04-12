"use client";

import { useEffect, useState } from "react";
import { Faculty } from "@/lib/types";

const FacultyDisplayPage = () => {
    const [facultyData, setFacultyData] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    if (loading) return <div className="p-4">Loading faculty data...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="p-8 mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Faculty Unavailability</h1>
            {facultyData.map((faculty) => (
                <div key={faculty._id} className="mb-6 border-b pb-4">
                    <h2 className="text-xl font-medium mb-2">{faculty.email}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {Object.entries(faculty.unavailability).map(([day, slots]) => (
                            <div key={day}>
                                <h3 className="capitalize font-semibold underline mb-2">{day}</h3>
                                {slots.length > 0 ? (
                                    slots.map((slot, index) => (
                                        <div key={index} className="mb-1">
                                            {slot.start || "–"} to {slot.end || "–"}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-400">No unavailability</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FacultyDisplayPage;
