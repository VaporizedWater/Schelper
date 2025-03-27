'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Define settings sections
const SETTINGS_SECTIONS = [
    { id: 'profile', label: 'User Profile', group: 'user' },
    { id: 'appearance', label: 'Appearance', group: 'user' },
    { id: 'notifications', label: 'Notifications', group: 'user' },
    { id: 'privacy', label: 'Privacy & Safety', group: 'user' },
    { id: 'security', label: 'Security', group: 'user' },
    { id: 'advanced', label: 'Advanced', group: 'user' },
    { id: 'calendar', label: 'Calendar', group: 'calendar' },
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
        <div className="flex h-screen relative overflow-hidden">
            {/* Left sidebar - independently scrollable */}
            <div className="w-60 bg-gray-100 overflow-y-auto border-r border-gray-200">
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
            <div className="flex-1 overflow-y-auto relative pr-16">
                <div className="p-8">
                    {activeSection === 'profile' && <ProfileSettings />}
                    {activeSection === 'appearance' && <AppearanceSettings />}
                    {activeSection === 'notifications' && <NotificationSettings />}
                    {activeSection === 'privacy' && <PrivacySettings />}
                    {activeSection === 'security' && <SecuritySettings />}
                    {activeSection === 'advanced' && <AdvancedSettings />}
                    {activeSection === 'calendar' && <CalendarSettings />}
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