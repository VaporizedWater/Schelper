'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import xlsx, { WorkBook, WorkSheet } from 'xlsx';
import { useCalendarContext } from '@/components/CalendarContext/CalendarContext';
import { insertCohort, loadCohorts } from '@/lib/DatabaseUtils';
import { CohortType } from '@/lib/types';
import { useSession } from 'next-auth/react';

// Define settings sections
const SETTINGS_SECTIONS = [
    { id: 'profile', label: 'User Profile', group: 'user' },
    { id: 'appearance', label: 'Appearance', group: 'user' },
    { id: 'notifications', label: 'Notifications', group: 'user' },
    { id: 'privacy', label: 'Privacy & Safety', group: 'user' },
    { id: 'security', label: 'Security', group: 'user' },
    { id: 'advanced', label: 'Advanced', group: 'user' },
    { id: 'calendar', label: 'Calendar', group: 'calendar' },
    { id: 'cohorts', label: 'Cohorts', group: 'calendar' },
    { id: 'sheet', label: 'Sheet', group: 'calendar' },
    { id: 'export', label: 'Export', group: 'calendar' },
    { id: 'import', label: 'Import', group: 'calendar' },
    { id: 'conflicts', label: 'Conflicts', group: 'calendar' },
    { id: 'tags', label: 'Tags', group: 'tags' },
];

// Group settings for cleaner UI
const SECTION_GROUPS = [
    { id: 'user', label: 'User Settings' },
    { id: 'calendar', label: 'Calendar Settings' },
    { id: 'tags', label: 'Tags' },
];

export default function SettingsPage() {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState('profile');

    // Group sections for display
    const groupedSections = SECTION_GROUPS.map(group => ({
        ...group,
        items: SETTINGS_SECTIONS.filter(section => section.group === group.id)
    }));

    const handleEscClick = () => {
        router.back();
    };

    return (
        <div className="flex h-full relative" onKeyDown={(e) => {
            if (e.key === 'Escape') {
                handleEscClick();
            }
        }}>
            {/* Left sidebar - independently scrollable */}
            <div className="w-60 bg-gray-100 overflow-y-auto border-r border-gray-200 sticky top-15 self-start h-full">
                <div className="p-4">
                    <h2 className="mb-4 pb-2 border-b border-gray-200 font-semibold text-lg">Settings</h2>
                    <nav>
                        {groupedSections.map((group) => (
                            <div key={group.id} className="mb-3">
                                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 px-1">{group.label}</h3>
                                <div className="space-y-0.5">
                                    {group.items.map((section) => (
                                        <button
                                            key={section.id}
                                            className={`block w-full text-left py-1.5 px-3 rounded-md text-sm hover:bg-gray-200 ${activeSection === section.id ? 'bg-gray-200 font-semibold' : ''}`}
                                            onClick={() => setActiveSection(section.id)}
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
            <div className="flex-1 overflow-y-auto pr-16">
                <div className="p-8">
                    {activeSection === 'profile' && <ProfileSettings />}
                    {activeSection === 'appearance' && <AppearanceSettings />}
                    {activeSection === 'notifications' && <NotificationSettings />}
                    {activeSection === 'privacy' && <PrivacySettings />}
                    {activeSection === 'security' && <SecuritySettings />}
                    {activeSection === 'advanced' && <AdvancedSettings />}
                    {activeSection === 'calendar' && <CalendarSettings />}
                    {activeSection === 'cohorts' && <CohortSettings />}
                    {activeSection === 'sheet' && <SheetSettings />}
                    {activeSection === 'export' && <ExportSettings />}
                    {activeSection === 'import' && <ImportSettings />}
                    {activeSection === 'conflicts' && <ConflictsSettings />}
                    {activeSection === 'tags' && <TagsSettings />}
                </div>
            </div>

            {/* Fixed ESC button */}
            <div className="fixed mt-15 right-4 top-4 flex flex-col items-center">
                <button
                    onClick={handleEscClick}
                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Go back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <span className="text-xs mt-1 text-gray-600">ESC</span>
            </div>
        </div>
    );
}

// Existing settings components
function ProfileSettings() {
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6">User Profile</h2>
            <form>
                <div className="mb-4">
                    <label htmlFor="display-name" className="block mb-2 font-medium text-gray-700">Display Name</label>
                    <input
                        type="text"
                        id="display-name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block mb-2 font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="bio" className="block mb-2 font-medium text-gray-700">Bio</label>
                    <textarea
                        id="bio"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                </div>
                <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
}

function AppearanceSettings() {
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6">Appearance</h2>
            <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">Theme</label>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input type="radio" name="theme" value="light" className="mr-2" />
                        <span>Light</span>
                    </label>
                    <label className="flex items-center">
                        <input type="radio" name="theme" value="dark" className="mr-2" />
                        <span>Dark</span>
                    </label>
                    <label className="flex items-center">
                        <input type="radio" name="theme" value="system" className="mr-2" />
                        <span>System Default</span>
                    </label>
                </div>
            </div>
        </div>
    );
}

function NotificationSettings() {
    return <h2 className="text-2xl font-semibold mb-6">Notification Settings</h2>;
}

function PrivacySettings() {
    return <h2 className="text-2xl font-semibold mb-6">Privacy Settings</h2>;
}

function SecuritySettings() {
    return <h2 className="text-2xl font-semibold mb-6">Security Settings</h2>;
}

function AdvancedSettings() {
    return <h2 className="text-2xl font-semibold mb-6">Advanced Settings</h2>;
}

// New calendar-related settings components
function CalendarSettings() {
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6">Calendar Settings</h2>
            <div className="space-y-4">
                <div className="mb-3">
                    <label htmlFor="default-view" className="block mb-1 font-medium text-gray-700">Default View</label>
                    <select id="default-view" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Month</option>
                        <option>Week</option>
                        <option>Day</option>
                        <option>Agenda</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="start-day" className="block mb-1 font-medium text-gray-700">Week Starts On</label>
                    <select id="start-day" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Sunday</option>
                        <option>Monday</option>
                    </select>
                </div>
                <div className="flex items-center mb-3">
                    <input type="checkbox" id="show-weekends" className="mr-2" />
                    <label htmlFor="show-weekends" className="font-medium text-gray-700">Show weekends</label>
                </div>
            </div>
        </div>
    );
}

function CohortSettings() {
    // State to store loaded cohorts
    const [cohorts, setCohorts] = useState<CohortType[]>([]);

    // Load cohorts when component mounts
    useEffect(() => {
        async function fetchCohorts() {
            const result = await loadCohorts(session?.user?.email || '', 'true');
            setCohorts(result);
            console.log('Loaded cohorts:', result);
        }
        fetchCohorts();
    }, []); // eslint-disable-line @typescript-eslint/react-hooks/exhaustive-deps


    const { currentCalendar } = useCalendarContext();
    const { data: session } = useSession();
    console.log('Current Calendar:', currentCalendar);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update state type to match CohortType
    const [cohort, setCohort] = useState<CohortType | null>(null);

    // Define a type for the structured cohort data
    interface CohortCourses {
        Fall: string[];
        Spring: string[];
    }

    // Transform function remains the same
    function transformRawData(rawRows: (string | number | null | undefined)[][]): Record<string, CohortCourses> {
        // Existing transformation logic
        const cohorts: Record<string, CohortCourses> = {};
        let currentCohort: string | null = null;

        const headersToSkip = new Set([
            'MECHANICAL ENGINEERING - ON TRACK',
            'Fall',
            'Spring'
        ]);

        for (const row of rawRows) {
            // Skip empty rows
            if (!row || row.length === 0 || row.every(cell => !cell?.toString().trim())) {
                continue;
            }

            const firstCell = row[0]?.toString().trim();

            if (firstCell && headersToSkip.has(firstCell)) {
                continue;
            }

            if (firstCell) {
                currentCohort = firstCell;
                if (!currentCohort) {
                    continue;
                }

                if (!cohorts[currentCohort]) {
                    cohorts[currentCohort] = { Fall: [], Spring: [] };
                }
            }

            if (currentCohort) {
                const fallCourse = row[1]?.toString().trim();
                const springCourse = row[2]?.toString().trim();

                if (fallCourse) {
                    cohorts[currentCohort].Fall.push(fallCourse);
                }
                if (springCourse) {
                    cohorts[currentCohort].Spring.push(springCourse);
                }
            }
        }

        return cohorts;
    }

    // Handle file uploads
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const data = await file.arrayBuffer();
            const workbook: WorkBook = xlsx.read(data, { type: 'array' });
            const sheetName: string = workbook.SheetNames[0];
            const worksheet: WorkSheet = workbook.Sheets[sheetName];
            const rawRows: (string | number | null | undefined)[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

            if (!rawRows || rawRows.length === 0) {
                alert("No data found in the uploaded file.");
                return;
            }

            // Transform raw rows into structured cohorts
            const parsedCohorts = transformRawData(rawRows);

            // Create a proper CohortType structure
            const newCohort: CohortType = {
                freshman: [],
                sophomore: [],
                junior: [],
                senior: []
            };

            // Map courses to the appropriate year based on semester
            if (currentCalendar.semester === 'FA') {
                // Assuming the first entry is freshman courses, second is sophomore, etc.
                const cohortEntries = Object.entries(parsedCohorts);
                if (cohortEntries.length >= 1) newCohort.freshman = cohortEntries[0][1].Fall;
                if (cohortEntries.length >= 2) newCohort.sophomore = cohortEntries[1][1].Fall;
                if (cohortEntries.length >= 3) newCohort.junior = cohortEntries[2][1].Fall;
                if (cohortEntries.length >= 4) newCohort.senior = cohortEntries[3][1].Fall;

            } else if (currentCalendar.semester === 'SP') {
                const cohortEntries = Object.entries(parsedCohorts);
                if (cohortEntries.length >= 1) newCohort.freshman = cohortEntries[0][1].Spring;
                if (cohortEntries.length >= 2) newCohort.sophomore = cohortEntries[1][1].Spring;
                if (cohortEntries.length >= 3) newCohort.junior = cohortEntries[2][1].Spring;
                if (cohortEntries.length >= 4) newCohort.senior = cohortEntries[3][1].Spring;

            }

            setCohort(newCohort);
            console.log('Parsed cohort:', newCohort);
        } catch (error) {
            console.error('Error reading file:', error);
        }
    };

    const handleSaveCohort = async () => {
        if (!cohort) {
            alert("Missing cohort data");
            return;
        }

        try {
            if (!session?.user?.email) {
                alert("User email is not available");
                return;
            }

            const result = await insertCohort(session.user.email, cohort);
            if (result) {
                alert("Cohort saved successfully!");
            } else {
                alert("Failed to save cohort");
            }
        } catch (error) {
            console.error("Error saving cohort:", error);
            alert("An error occurred while saving the cohort");
        }
    };

    const handleCancel = () => {
        setCohort(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className='flex-1'>
            <h2 className="text-2xl font-semibold mb-6">Cohorts Settings</h2>

            {/* File upload input */}
            <div className="mb-3">
                <label htmlFor="cohort-file" className="block mb-1 font-medium text-gray-700">
                    Upload Cohort Spreadsheet
                </label>
                <input
                    ref={fileInputRef}
                    type="file"
                    id="cohort-file"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
                />
            </div>

            {/* Save and Cancel buttons */}
            {cohort && (
                <div className="flex space-x-3 mt-4">
                    <button
                        onClick={handleSaveCohort}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Save Cohort
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Display parsed data */}
            {cohort && (
                <div className="mt-5">
                    <h3 className="font-semibold">Parsed Data Preview:</h3>
                    <div className="mt-2 p-4 bg-gray-100 rounded-md overflow-auto">
                        <h4 className="font-medium">Freshman Courses:</h4>
                        <ul className="list-disc ml-5">
                            {cohort.freshman.map((course, index) => (
                                <li key={`freshman-${index}`}>{course}</li>
                            ))}
                        </ul>

                        <h4 className="font-medium mt-3">Sophomore Courses:</h4>
                        <ul className="list-disc ml-5">
                            {cohort.sophomore.map((course, index) => (
                                <li key={`sophomore-${index}`}>{course}</li>
                            ))}
                        </ul>

                        <h4 className="font-medium mt-3">Junior Courses:</h4>
                        <ul className="list-disc ml-5">
                            {cohort.junior.map((course, index) => (
                                <li key={`junior-${index}`}>{course}</li>
                            ))}
                        </ul>

                        <h4 className="font-medium mt-3">Senior Courses:</h4>
                        <ul className="list-disc ml-5">
                            {cohort.senior.map((course, index) => (
                                <li key={`senior-${index}`}>{course}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Display all existing cohorts neatly */}
            <div className="mt-5">
                <h3 className="font-semibold">Existing Cohorts:</h3>
                {cohorts.length > 0 ? (
                    <div className="mt-2 p-4 bg-gray-100 rounded-md overflow-auto">
                        {cohorts.map((cohort, index) => (
                            <div key={index} className="mb-4">
                                <h4 className="font-medium">Cohort {index + 1}:</h4>
                                <ul className="list-disc ml-5">
                                    <li>Freshman: {cohort.freshman.join(', ')}</li>
                                    <li>Sophomore: {cohort.sophomore.join(', ')}</li>
                                    <li>Junior: {cohort.junior.join(', ')}</li>
                                    <li>Senior: {cohort.senior.join(', ')}</li>
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No existing cohorts found.</p>
                )}
            </div>
        </div>
    );
}

function SheetSettings() {
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6">Sheet Settings</h2>
            <div className="space-y-4">
                <div className="mb-3">
                    <label className="block mb-1 font-medium text-gray-700">Default Sheet View</label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input type="radio" name="sheet-view" value="compact" className="mr-2" />
                            <span>Compact</span>
                        </label>
                        <label className="flex items-center">
                            <input type="radio" name="sheet-view" value="detailed" className="mr-2" />
                            <span>Detailed</span>
                        </label>
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="columns" className="block mb-1 font-medium text-gray-700">Visible Columns</label>
                    <div className="space-y-1">
                        <div className="flex items-center">
                            <input type="checkbox" id="col-name" checked className="mr-2" />
                            <label htmlFor="col-name">Name</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="col-date" checked className="mr-2" />
                            <label htmlFor="col-date">Date</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="col-tags" checked className="mr-2" />
                            <label htmlFor="col-tags">Tags</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ExportSettings() {
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6">Export Settings</h2>
            <div className="space-y-4">
                <div className="mb-3">
                    <label htmlFor="export-format" className="block mb-1 font-medium text-gray-700">Default Export Format</label>
                    <select id="export-format" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>iCalendar (.ics)</option>
                        <option>CSV</option>
                        <option>JSON</option>
                    </select>
                </div>
                <div className="flex items-center mb-3">
                    <input type="checkbox" id="include-tags" className="mr-2" />
                    <label htmlFor="include-tags" className="font-medium text-gray-700">Include tags in exports</label>
                </div>
            </div>
        </div>
    );
}

function ImportSettings() {
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6">Import Settings</h2>
            <div className="space-y-4">
                <div className="mb-3">
                    <label className="block mb-1 font-medium text-gray-700">When Importing Duplicates</label>
                    <div className="space-y-1">
                        <div className="flex items-center">
                            <input type="radio" name="duplicate-action" value="skip" className="mr-2" />
                            <span>Skip</span>
                        </div>
                        <div className="flex items-center">
                            <input type="radio" name="duplicate-action" value="replace" className="mr-2" />
                            <span>Replace</span>
                        </div>
                        <div className="flex items-center">
                            <input type="radio" name="duplicate-action" value="ask" className="mr-2" />
                            <span>Always ask</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ConflictsSettings() {
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6">Conflict Settings</h2>
            <div className="space-y-4">
                <div className="mb-3">
                    <label className="block mb-1 font-medium text-gray-700">When Events Conflict</label>
                    <div className="space-y-1">
                        <div className="flex items-center">
                            <input type="radio" name="conflict-action" value="warn" className="mr-2" />
                            <span>Show warning</span>
                        </div>
                        <div className="flex items-center">
                            <input type="radio" name="conflict-action" value="allow" className="mr-2" />
                            <span>Allow conflicts</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center mb-3">
                    <input type="checkbox" id="highlight-conflicts" className="mr-2" />
                    <label htmlFor="highlight-conflicts" className="font-medium text-gray-700">Highlight conflicts in calendar</label>
                </div>
            </div>
        </div>
    );
}

function TagsSettings() {
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6">Tags Settings</h2>
            <div className="space-y-4">
                <div className="mb-3">
                    <label className="block mb-1 font-medium text-gray-700">Manage Tags</label>
                    <div className="border border-gray-300 rounded-md p-2 mb-2 max-h-60 overflow-y-auto">
                        {/* Sample tag items */}
                        <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                                <span>Important</span>
                            </div>
                            <button className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                                <span>Class</span>
                            </div>
                            <button className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                                <span>Exam</span>
                            </div>
                            <button className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                    </div>
                    <div className="flex mt-2">
                        <input
                            type="text"
                            placeholder="New tag name"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            className="px-3 py-2 bg-blue-600 text-white font-medium rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}