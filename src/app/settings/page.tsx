"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCalendarContext } from '@/components/CalendarContext/CalendarContext';
import { loadUserSettings, updateUserSettings } from '@/lib/DatabaseUtils';
import { ConflictColor } from '@/lib/types';
import { useSession } from 'next-auth/react';
import AddTagButton from "@/components/AddTagButton/AddTagButton";
import TagDisplay from "@/components/TagDisplay/TagDisplay";
import { BiUnlink } from "react-icons/bi";
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import { useTheme } from 'next-themes';
import { defaultSettings } from '@/lib/common';
import { useToast } from '@/components/Toast/Toast';
import { useConfirm } from '@/components/Confirm/Confirm';

// Define settings sections
const SETTINGS_SECTIONS = [
    { id: 'appearance', label: 'Appearance', group: 'general' },
    { id: 'conflicts', label: 'Conflicts', group: 'user' },
    { id: 'tags', label: 'Tags', group: 'tags' },
];

// Group settings for cleaner UI
const SECTION_GROUPS = [
    { id: 'general', label: 'General' },
    { id: 'user', label: 'User' },
    { id: 'tags', label: 'Tags' },
];

export default function SettingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initial = (searchParams.get('section') as string) ?? 'appearance';
    const [activeSection, setActiveSection] = useState<string>(initial);

    const handleActiveClick = (sectionId: string) => {
        router.replace(`/settings?section=${sectionId}`);
        setActiveSection(sectionId);
    }

    // Build grouped nav
    const groupedSections = SECTION_GROUPS.map(g => ({
        ...g,
        items: SETTINGS_SECTIONS.filter(s => s.group === g.id)
    }));

    const handleEscClick = () => {
        router.back();
    };

    // Add global ESC key listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleEscClick();
            }
        };

        // Add event listener
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup function
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="flex h-full relative bg-white dark:bg-zinc-800 text-black dark:text-gray-200">
            {/* Left sidebar - independently scrollable */}
            <div className="w-60 bg-gray-100 dark:bg-zinc-700 overflow-y-auto border-r border-gray-200 dark:border-zinc-600 sticky top-15 self-start h-full">
                <div className="p-4">
                    <h2 className="mb-4 pb-2 border-b border-gray-200 dark:border-zinc-600 font-semibold text-lg">Settings</h2>
                    <nav>
                        {groupedSections.map((group) => (
                            <div key={group.id} className="mb-3">
                                <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1 px-1">{group.label}</h3>
                                <div className="space-y-0.5">
                                    {group.items.map((section) => (
                                        <button
                                            key={section.id}
                                            className={`block w-full text-left py-1.5 px-3 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-zinc-600 ${activeSection === section.id ? 'bg-gray-200 dark:bg-zinc-600 font-semibold' : ''}`}
                                            onClick={() => handleActiveClick(section.id)}
                                        >
                                            {section.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Right content - independently scrollable with padding for the ESC button */}
            <div className="flex-1 overflow-y-auto pr-16 dark:bg-zinc-800">
                <div className="p-8">
                    {activeSection === 'appearance' && <AppearanceSettings />}
                    {activeSection === 'conflicts' && <ConflictsSettings />}
                    {activeSection === 'tags' && <TagsSettings />}
                </div>
            </div>

            {/* Fixed ESC button */}
            <div className="fixed mt-15 right-4 top-4 flex flex-col items-center">
                <button
                    onClick={handleEscClick}
                    className="w-8 h-8 bg-gray-200 dark:bg-zinc-600 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-zinc-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Go back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">ESC</span>
            </div>
        </div>
    );
}

// Existing settings components
function AppearanceSettings() {
    const { theme } = useTheme();
    return (
        <div className="text-black dark:text-gray-300">
            <h2 className="text-2xl font-semibold mb-6">Appearance</h2>
            <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-400 capitalize">Theme: {theme}</label>
                <ThemeToggle />
            </div>
        </div>
    );
}

function ConflictsSettings() {
    // Define state for conflict colors with default values matching the ones in Calendar.tsx
    const { data: session } = useSession();
    const { toast } = useToast();

    const [originalColors, setOriginalColors] = useState<ConflictColor>(defaultSettings.settings.conflicts);
    const [workingColors, setWorkingColors] = useState<ConflictColor>(defaultSettings.settings.conflicts);

    useEffect(() => {
        // don’t try to fetch until we have a real email
        if (!session?.user?.email) return;

        const email = session?.user?.email;

        async function loadColors() {
            try {
                const resp = await loadUserSettings();

                const fromServer = resp?.settings?.conflicts ?? {};

                // merge defaults + server so you never lose missing keys:
                const merged = { ...defaultSettings.settings.conflicts, ...fromServer };

                setOriginalColors(merged);
                setWorkingColors(merged);
            } catch (err) {
                toast({ description: "Couldn’t fetch settings for " + email + ": " + err, variant: 'error' })
            }
        }

        loadColors();
    }, [session?.user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

    const isEqual = (a: ConflictColor, b: ConflictColor) => JSON.stringify(a) === JSON.stringify(b);

    return (
        <div className="bg-white dark:bg-zinc-800 text-black dark:text-gray-200">
            <h2 className="text-2xl font-semibold mb-6">Conflict Settings</h2>

            {/* Conflict color table */}
            <div className="border dark:border-zinc-600 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-600">
                    <thead className="bg-gray-50 dark:bg-zinc-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Conflict Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Color
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-200 dark:divide-zinc-700">
                        <tr>
                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                                All (Room + Instructor + Cohort)
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <input
                                    type="color"
                                    value={workingColors["all"] ?? "#ffffff"} // Default to red if not set
                                    onChange={(e) => setWorkingColors(w => ({ ...w, all: e.target.value }))}
                                    className="w-10 h-8"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                                Room + Instructor
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <input
                                    type="color"
                                    value={workingColors["roomInstructor"] || "#f97316"} // Default to orange if not set
                                    onChange={(e) => setWorkingColors(w => ({ ...w, roomInstructor: e.target.value }))}
                                    className="w-10 h-8"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                                Room + Cohort
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <input
                                    type="color"
                                    value={workingColors["roomCohort"] || "#f97316"} // Default to orange if not set
                                    onChange={(e) => setWorkingColors(w => ({ ...w, roomCohort: e.target.value }))}
                                    className="w-10 h-8"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                                Instructor + Cohort
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <input
                                    type="color"
                                    value={workingColors["instructorCohort"] || "#f97316"} // Default to orange if not set
                                    onChange={(e) => setWorkingColors(w => ({ ...w, instructorCohort: e.target.value }))}
                                    className="w-10 h-8"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                                Room only
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <input
                                    type="color"
                                    value={workingColors["room"] || "#f59e0b"} // Default to amber if not set
                                    onChange={(e) => setWorkingColors(w => ({ ...w, room: e.target.value }))}
                                    className="w-10 h-8"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                                Instructor only
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <input
                                    type="color"
                                    value={workingColors["instructor"] || "#f59e0b"} // Default to amber if not set
                                    onChange={(e) => setWorkingColors(w => ({ ...w, instructor: e.target.value }))}
                                    className="w-10 h-8"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                                Cohort only
                            </td>
                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <input
                                    type="color"
                                    value={workingColors["cohort"] ?? "#f59e0b"} // Default to amber if not set
                                    onChange={(e) => setWorkingColors(w => ({ ...w, cohort: e.target.value }))}
                                    className="w-10 h-8"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* --- New Button Bar --- */}
            <div className="flex justify-end space-x-3 mt-4">
                {/* Cancel */}
                <button
                    onClick={() => setWorkingColors(originalColors)}
                    disabled={isEqual(workingColors, originalColors)}
                    className="px-4 py-2
                    bg-gray-200 dark:bg-zinc-600
                    text-gray-800 dark:text-gray-200
                    rounded-md
                    hover:bg-gray-300 dark:hover:bg-zinc-500
                    transition-colors duration-150
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancel
                </button>

                {/* Save */}
                <button
                    onClick={async () => {
                        const success = await updateUserSettings({ settings: { conflicts: workingColors } });

                        if (success) {
                            setOriginalColors(workingColors);
                            toast({ description: "Successfully updated conflict colors!", variant: "success" })
                        };
                    }}
                    disabled={isEqual(workingColors, originalColors)}
                    className="
      px-4 py-2
      bg-blue-600 dark:bg-blue-700
      text-white
      rounded-md
      hover:bg-blue-700 dark:hover:bg-blue-600
      transition-colors duration-150
      disabled:opacity-50 disabled:cursor-not-allowed
    "
                >
                    Save
                </button>
            </div>
        </div>
    );
}

function TagsSettings() {
    const { unlinkAllTagsFromAllClasses } = useCalendarContext();
    const { confirm: confirmDialog } = useConfirm();

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6 bg-transparent dark:text-gray-200">Tags Settings</h2>

            {/* Tag Menu */}
            <div className="flex justify-center pb-4 gap-2">
                <AddTagButton />

                <button
                    className="flex gap-2 items-center justify-center bg-white dark:bg-zinc-700 px-2 shadow-lg border border-gray-300 dark:border-zinc-600 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors duration-150 w-fit text-black dark:text-gray-200"
                    onClick={async () => {
                        // Get confirmation from user
                        const isConfirmed = await confirmDialog({
                            title: "Unlink all tags?",
                            description:
                                "This will unlink every tag from every class.\nIt will NOT delete any tags.",
                            confirmText: "Unlink All",
                            cancelText: "Cancel",
                            variant: "danger",
                        });
                        if (!isConfirmed) return;

                        // unlink all tags
                        unlinkAllTagsFromAllClasses();
                    }}
                >
                    <BiUnlink className="text-xl" />
                    <span className="pr-2">Unlink All</span>
                </button>
            </div>

            {/* Display all tags*/}
            <div className="px-10 w-full flex flex-col gap-3 pb-10">
                <TagDisplay />
            </div>
        </div>
    );
}