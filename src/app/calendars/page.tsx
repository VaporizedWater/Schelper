"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MdAdd, MdDelete, MdOpenInNew, MdCalendarMonth } from 'react-icons/md';
import { BsCalendarCheck, BsCalendarX } from 'react-icons/bs';
import { CalendarInfo, CalendarSettingType, CalendarType, ClassData, ClassProperty } from '@/lib/types';
import Link from 'next/link';

export default function CalendarsPage() {
    const router = useRouter();
    const { data: session } = useSession();

    // Add mock data for development
    const [calendars, setCalendars] = useState<CalendarType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Mock calendar data for development
    useEffect(() => {
        // Create mock class data that conforms to ClassData type
        const createMockClassData = (index: number): ClassData => ({
            catalog_num: `${100 + index % 10}`,
            class_num: `${10000 + index}`,
            course_num: `${200 + index % 20}`,
            session: "regular",
            course_subject: ["CS", "MATH", "ENG", "PHYS", "CHEM"][index % 5],
            title: `Mock Class ${index}`,
            section: `00${index % 9 + 1}`,
            enrollment_cap: "25",
            waitlist_cap: "5"
        });

        // Create mock properties that conform to ClassProperty type
        const createMockProperties = (index: number, prefix: number): ClassProperty => ({
            days: (index % 3 === 0) ? ["Mon", "Wed", "Fri"] :
                (index % 3 === 1) ? ["Tue", "Thu"] : ["Mon", "Wed"],
            start_time: (index % 2 === 0) ? "09:00" : "11:00",
            end_time: (index % 2 === 0) ? "10:15" : "12:15",
            room: `Room ${prefix + index % 20}`,
            instructor_name: `Instructor ${(index + prefix / 100) % 10}`,
            instructor_email: `instructor${(index + prefix / 100) % 10}@university.edu`,
            tags: [],
            class_status: "Open",
            facility_id: `F-${prefix + index % 30}`,
            total_enrolled: `${15 + index % 10}`,
            total_waitlisted: `${index % 5}`,
            cohort: `Cohort ${index % 3}`,
            owners: session?.user?.email ? [session.user.email] : []
        });

        // Simulate API loading delay
        const timer = setTimeout(() => {
            const mockCalendars: CalendarType[] = [
                {
                    _id: '1',
                    info: {
                        name: 'Fall 2023',
                        semester: 'FA',
                        year: "2023"
                    } as CalendarInfo,
                    classes: Array(24).fill(null).map((_, i) => ({
                        _id: `class-${i}`,
                        data: createMockClassData(i),
                        properties: createMockProperties(i, 100),
                        events: [],
                        visible: true
                    })),
                    settings: {} as CalendarSettingType
                },
                {
                    _id: '2',
                    info: {
                        name: 'Spring 2024',
                        semester: 'SP',
                        year: "2024"
                    } as CalendarInfo,
                    classes: Array(18).fill(null).map((_, i) => ({
                        _id: `class-${i + 25}`,
                        data: createMockClassData(i + 25),
                        properties: createMockProperties(i + 25, 200),
                        events: [],
                        visible: true
                    })),
                    settings: {} as CalendarSettingType
                },
                {
                    _id: '3',
                    info: {
                        name: 'Summer 2024',
                        semester: 'SU',
                        year: "2024"
                    } as CalendarInfo,
                    classes: Array(8).fill(null).map((_, i) => ({
                        _id: `class-${i + 50}`,
                        data: createMockClassData(i + 50),
                        properties: createMockProperties(i + 50, 300),
                        events: [],
                        visible: true
                    })),
                    settings: {} as CalendarSettingType
                }
            ];

            setCalendars(mockCalendars);
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleDeleteCalendar = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            try {
                // Mock deleting a calendar
                setCalendars(prev => prev.filter(cal => cal._id !== id));
            } catch (err) {
                console.error("Error deleting calendar:", err);
                alert('Failed to delete calendar');
            }
        }
    };

    const navigateToCalendar = (id: string) => {
        // Mock setting current calendar and navigate
        console.log(`Setting current calendar to ID: ${id}`);
        router.push('/calendar');
    };

    const formatSemester = (code: string) => {
        switch (code) {
            case 'FA': return 'Fall';
            case 'SP': return 'Spring';
            case 'SU': return 'Summer';
            default: return code;
        }
    };

    const getCalendarStatusIcon = (classCount: number | undefined) => {
        if (!classCount) return <MdCalendarMonth className="text-gray-400" size={20} />;
        if (classCount > 25) return <BsCalendarCheck className="text-green-500" size={20} />;
        return <BsCalendarX className="text-orange-500" size={20} />;
    };

    // Helper function to get semester priority (for sorting)
    const getSemesterPriority = (semester: string): number => {
        switch (semester) {
            case 'FA': return 3; // Fall
            case 'SU': return 2; // Summer
            case 'SP': return 1; // Spring
            default: return 0;
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-zinc-800 min-h-screen text-black dark:text-gray-200">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">My Calendars</h1>
                        <div className="text-sm bg-blue-100 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-800 text-blue-800 dark:text-blue-300 px-4 py-2 rounded mt-2">
                            <p>Development mode: Some features are still being implemented.</p>
                        </div>
                    </div>
                    <Link
                        href="/createCalendar"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-150"
                    >
                        <MdAdd /> Create Calendar
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 dark:border-blue-400"></div>
                    </div>
                ) : calendars.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-zinc-700 rounded-lg p-8 text-center">
                        <div className="inline-block p-4 bg-gray-100 dark:bg-zinc-600 rounded-full mb-4">
                            <MdCalendarMonth className="text-gray-400 dark:text-gray-300" size={48} />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No Calendars Found</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            You don&apos;t have any calendars yet. Get started by creating your first calendar.
                        </p>
                        <Link
                            href="/createCalendar"
                            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-150"
                        >
                            Create Your First Calendar
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {calendars
                            .sort((a, b) => {
                                // Sort by year (descending)
                                const yearA = Number(a.info?.year);
                                const yearB = Number(b.info?.year);

                                if (yearA !== yearB) {
                                    return yearB - yearA;
                                }

                                // If years are the same, sort by semester priority (descending)
                                return getSemesterPriority(b.info?.semester || '') -
                                    getSemesterPriority(a.info?.semester || '');
                            })
                            .map((calendar) => (
                                <div
                                    key={calendar._id}
                                    className="bg-gray-50 dark:bg-zinc-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div className="p-5 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center">
                                                {getCalendarStatusIcon(calendar.classes?.length)}
                                                <h2 className="text-xl font-semibold ml-2">{calendar.info?.name}</h2>
                                            </div>
                                            <div className="flex space-x-1">
                                                <button
                                                    onClick={() => navigateToCalendar(calendar._id)}
                                                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors duration-150"
                                                    aria-label="Open calendar"
                                                >
                                                    <MdOpenInNew size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCalendar(calendar._id, calendar.info?.name)}
                                                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors duration-150 text-red-500 dark:text-red-400"
                                                    aria-label="Delete calendar"
                                                >
                                                    <MdDelete size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-auto space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Semester:</span>
                                                <span className="font-medium">{formatSemester(calendar.info?.semester)} {calendar.info?.year}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Classes:</span>
                                                <span className="font-medium">{calendar.classes?.length || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Last modified:</span>
                                                <span className="font-medium">{new Date().toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="h-2 w-full"
                                        style={{
                                            backgroundColor: calendar.info?.semester === 'FA' ? '#2563eb' :
                                                calendar.info?.semester === 'SP' ? '#10b981' :
                                                    '#f59e0b'
                                        }}
                                    ></div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
