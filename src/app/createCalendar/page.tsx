"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CalendarInfo } from '@/lib/types';
import { insertCalendar } from '@/lib/DatabaseUtils';
import { createCalendarFromInfo } from '@/lib/common';
import { useToast } from '@/components/Toast/Toast';

const CreateCalendarForm = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const { toast } = useToast();

    const [newCalendarInfo, setNewCalendarInfo] = useState<CalendarInfo>({
        _id: '',
        name: '',
        semester: 'FA',
        year: new Date().getFullYear(),
    });
    const [error, setError] = useState('');

    const handleCreateCalendar = async () => {
        if (!newCalendarInfo.name) {
            setError('Calendar name is required');
            return;
        }

        if (!session?.user?.email) {
            setError('You must be logged in to create a calendar');
            return;
        }

        try {
            // create new calendar
            const createdCalendar = createCalendarFromInfo(newCalendarInfo);

            // Call Database util function to save the calendar
            const response = await insertCalendar(createdCalendar);

            if (!response) {
                toast({ description: 'Failed to create calendar', variant: 'error' });
                throw new Error('Failed to create calendar');
            } else {
                toast({ description: 'Calendar created successfully', variant: 'success' });
            }

            // Return to the previous page
            router.back();
        } catch (err) {
            console.error("Error creating calendar:", err);
            setError('Failed to create calendar');
        }
    };

    return (
        <div className="h-full p-4 bg-white dark:bg-zinc-800 text-black dark:text-gray-200">
            <h2 className="text-2xl font-semibold mb-4">Create New Calendar</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Calendar Name *
                    </label>
                    <input
                        type="text"
                        value={newCalendarInfo.name}
                        onChange={(e) => setNewCalendarInfo({ ...newCalendarInfo, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Fall 2023"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Semester *
                        </label>
                        <select
                            value={newCalendarInfo.semester}
                            onChange={(e) => setNewCalendarInfo({ ...newCalendarInfo, semester: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="FA">Fall</option>
                            <option value="SP">Spring</option>
                            <option value="SU">Summer</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Year *
                        </label>
                        <input
                            type="number"
                            value={newCalendarInfo.year}
                            onChange={(e) => setNewCalendarInfo({ ...newCalendarInfo, year: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min={2020}
                            max={2100}
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-zinc-500 transition-colors duration-150"
                >
                    Cancel
                </button>
                <button
                    onClick={handleCreateCalendar}
                    className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-150"
                >
                    Create Calendar
                </button>
            </div>
        </div>
    );
}

export default CreateCalendarForm;