"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MdAdd, MdDelete, MdOpenInNew, MdCalendarMonth, MdSearch } from 'react-icons/md';
import { BsCalendarCheck, BsCalendarX } from 'react-icons/bs';
import { CalendarType } from '@/lib/types';
import Link from 'next/link';
import { deleteCalendar, loadCalendars } from '@/lib/DatabaseUtils';
import { useCalendarContext } from '@/components/CalendarContext/CalendarContext';

export default function CalendarsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { setContextToOtherCalendar } = useCalendarContext();

    // Real data loader
    const [calendars, setCalendars] = useState<CalendarType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentCalendarId, setCurrentCalendarId] = useState<string | null>(null);

    useEffect(() => {
        if (!session?.user?.email) return;

        // only fetch if calendars list is empty
        if (calendars.length > 0) {
            setIsLoading(false);
            return;
        }

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

                // Set current calendar id from loaded data
                if (current && current._id) {
                    setCurrentCalendarId(current._id);
                }
            })
            .catch(err => {
                console.error("Error loading calendars:", err);
            })
            .finally(() => setIsLoading(false));
    }, [session?.user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleDeleteCalendar = async (id: string, name: string, length: number) => {
        if (!session?.user?.email) {
            alert('You must be logged in to delete a calendar.');
            return;
        }

        if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            if (length > 0 && (confirm(`WARNING: You are about to delete ${name} which has ${length} classes. Are you sure?`))) {
                try {
                    const response = await deleteCalendar(session?.user?.email, id);

                    if (!response) {
                        throw new Error('Failed to delete calendar');
                    } else {
                        alert(`Calendar "${name}" deleted successfully.`);
                    }

                    setCalendars(prev => prev.filter(cal => cal._id !== id));
                } catch (err) {
                    console.error("Error deleting calendar:", err);
                    alert('Failed to delete calendar');
                }
            }
        }
    };

    const setCurrentCalendar = (id: string) => {
        if (!id || id === "") {
            alert('Invalid calendar ID');
            console.error('Invalid calendar ID:', id);
            return;
        }

        // Update state
        setCurrentCalendarId(id);

        // Update context
        setContextToOtherCalendar(id);
    }


    const navigateToCalendar = (id: string) => {
        if (!id || id === "") {
            alert('Invalid calendar ID');
            console.error('Invalid calendar ID:', id);
            return;
        }

        // Mock setting current calendar and navigate
        console.log(`Setting current calendar to ID: ${id}`);

        // Update state and context
        setCurrentCalendar(id);

        // Navigate to calendar page
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

    // Filter calendars by semester or year based on searchTerm
    const filteredCalendars = calendars.filter(calendar => {
        const semester = calendar.info?.semester || '';
        const year = calendar.info?.year?.toString() || '';
        const name = calendar.info?.name || '';
        const search = searchTerm.toLowerCase();
        return (
            semester.toLowerCase().includes(search) ||
            year.includes(search) ||
            name.toLowerCase().includes(search)
        );
    });

    return (
        <div className="p-6 bg-white dark:bg-zinc-800 min-h-screen text-black dark:text-gray-200">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-4 mb-8">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">My Calendars</h1>
                        {/* Search bar for semesters */}
                        <div className="relative mt-2 w-full flex">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdSearch className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by semester, year, or name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex items-end md:items-end">
                        <Link
                            href="/createCalendar"
                            className="flex items-center gap-2 px-4 py-2.25 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-150"
                        >
                            <MdAdd /> Create Calendar
                        </Link>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 dark:border-blue-400"></div>
                    </div>
                ) : calendars.length === 0 ? (
                    // No calendars exist case (unchanged)
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
                ) : filteredCalendars.length === 0 ? (
                    // No search results case (new)
                    <div className="bg-gray-50 dark:bg-zinc-700 rounded-lg p-8 text-center">
                        <div className="inline-block p-4 bg-gray-100 dark:bg-zinc-600 rounded-full mb-4">
                            <MdSearch className="text-gray-400 dark:text-gray-300" size={48} />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No Results</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            No calendars match your search. Try a different semester, year, or name.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCalendars
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
                            .map((calendar) => {
                                // Use local state for current calendar highlight
                                const isCurrent = (currentCalendarId === calendar._id);
                                return (
                                    <div
                                        key={calendar._id}
                                        className={
                                            "bg-gray-50 dark:bg-zinc-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300" +
                                            (isCurrent ? " ring-2 ring-blue-500 dark:ring-blue-400" : "")
                                        }
                                    >
                                        <div className="p-5 flex flex-col h-full">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center">
                                                    {getCalendarStatusIcon(calendar.classes?.length)}
                                                    <h2 className="text-xl font-semibold ml-2">{calendar.info?.name}</h2>
                                                    {isCurrent && (
                                                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex space-x-1 items-center">
                                                    {!isCurrent && (
                                                        <button
                                                            onClick={() => setCurrentCalendar(calendar._id || '')}
                                                            className="py-2 px-3 text-xs rounded text-white bg-green-600 dark:bg-emerald-600 hover:bg-green-700 dark:hover:bg-emerald-500 transition-colors duration-150 font-medium whitespace-nowrap"
                                                            aria-label="Set as current calendar"
                                                        >
                                                            Set as Current
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => navigateToCalendar(calendar._id || '')}
                                                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors duration-150"
                                                        aria-label="Open calendar"
                                                    >
                                                        <MdOpenInNew size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCalendar(calendar._id || '', calendar.info?.name, calendar.classes?.length || 0)}
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
                                );
                            })}
                    </div>
                )}
            </div>
        </div>
    );
}
