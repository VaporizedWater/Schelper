"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MdAdd, MdDelete, MdOpenInNew, MdCalendarMonth } from 'react-icons/md';
import { BsCalendarCheck, BsCalendarX } from 'react-icons/bs';
import { CalendarType } from '@/lib/types';
import Link from 'next/link';
import { loadCalendars } from '@/lib/DatabaseUtils';

export default function CalendarsPage() {
    const router = useRouter();
    const { data: session } = useSession();

    // Real data loader
    const [calendars, setCalendars] = useState<CalendarType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!session?.user?.email) return;
        setIsLoading(true);

        loadCalendars(session.user.email)
            .then(({ calendar: current, calendars: list }) => {
                // map your CalendarInfo[] into CalendarType[], attaching the classes array
                const typedList: CalendarType[] = list.map(info => ({
                    _id: info._id!,
                    info,
                    classes: info._id === current._id ? current.classes : []
                }));

                setCalendars(typedList);
            })
            .catch(err => {
                console.error("Error loading calendars:", err);
            })
            .finally(() => setIsLoading(false));
    }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

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
                            .filter(calendar => (calendar._id !== null))
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
                                                    onClick={() => navigateToCalendar(calendar._id || '')}
                                                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors duration-150"
                                                    aria-label="Open calendar"
                                                >
                                                    <MdOpenInNew size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCalendar(calendar._id || '', calendar.info?.name)}
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
