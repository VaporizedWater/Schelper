"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import xlsx, { WorkBook, WorkSheet } from 'xlsx';
import { useCalendarContext } from '@/components/CalendarContext/CalendarContext';
import { insertCohort, loadCohorts, updateCohort, setCurrentCohortInDb, loadUserSettings, updateUserSettings } from '@/lib/DatabaseUtils';
import { CohortType, ConflictColor } from '@/lib/types';
import { useSession } from 'next-auth/react';
import AddTagButton from "@/components/AddTagButton/AddTagButton";
import TagDisplay from "@/components/TagDisplay/TagDisplay";
import { BiUnlink } from "react-icons/bi";
import { MdArrowRightAlt, MdDelete, MdFileUpload } from 'react-icons/md';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import { useTheme } from 'next-themes';
import { defaultSettings, newSemesterCourses } from '@/lib/common';
import Link from 'next/link';
import { useToast } from '@/components/Toast/Toast';

// Define settings sections
const SETTINGS_SECTIONS = [
    { id: 'appearance', label: 'Appearance', group: 'general' },
    { id: 'cohorts', label: 'Cohorts', group: 'department' },
    { id: 'classes', label: 'Classes', group: 'department' },
    { id: 'faculty', label: 'Faculty', group: 'department' },
    { id: 'conflicts', label: 'Conflicts', group: 'user' },
    { id: 'tags', label: 'Tags', group: 'tags' },
];

// Group settings for cleaner UI
const SECTION_GROUPS = [
    { id: 'general', label: 'General' },
    { id: 'department', label: 'Department' },
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
                    {activeSection === 'cohorts' && <CohortSettings />}
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

// New calendar-related settings components
function CohortSettings() {
    // State to store loaded cohorts
    const [cohorts, setCohorts] = useState<CohortType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // In the CohortSettings component, add a new state variable
    const [currentCohortId, setCurrentCohortId] = useState<string | null>(null);
    const { data: session } = useSession();
    const { currentCalendar, removeCohort, currentDepartment } = useCalendarContext();

    // Load cohorts when component mounts
    useEffect(() => {
        async function fetchCohorts() {
            setIsLoading(true);
            try {
                if (!session?.user?.email) return;

                if (!currentDepartment || !currentDepartment._id) {
                    console.log("No current department found for the user.", currentDepartment);
                    setIsLoading(false);
                    return;
                }

                // Get all cohorts
                const result = await loadCohorts(currentDepartment._id, 'true');
                setCohorts(result);

                // Get the current cohort separately to identify which one is current
                const currentCohort = await loadCohorts(currentDepartment._id, 'false');
                if (currentCohort && currentCohort[0] && currentCohort[0]._id) {
                    setCurrentCohortId(currentCohort[0]._id as string);
                }
                console.log('Current cohort:', currentCohort);
            } catch (error) {
                console.error('Error loading cohorts:', error);
                toast({ description: 'Failed to load cohorts', variant: 'error' });
            } finally {
                setIsLoading(false);
            }
        }
        fetchCohorts();
        // eslint-disable-next-line
    }, [session?.user?.email, currentDepartment]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update state type to match CohortType
    const [cohort, setCohort] = useState<CohortType | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [editingCohortId, setEditingCohortId] = useState<string | null>(null);
    const [editNameValue, setEditNameValue] = useState('');
    const [chosenSemester, setChosenSemester] = useState<'Fall' | 'Spring'>(['FA', 'FALL'].includes(currentCalendar.info.semester.toLocaleUpperCase()) ? 'Fall' : 'Spring');

    const { toast } = useToast();

    // Define a type for the structured cohort data
    interface CohortCourses {
        Fall: string[];
        Spring: string[];
        Summer?: string[];
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

        setFileName(file.name);
        setIsLoading(true);

        try {
            const data = await file.arrayBuffer();
            const workbook: WorkBook = xlsx.read(data, { type: 'array' });
            const sheetName: string = workbook.SheetNames[0];
            const worksheet: WorkSheet = workbook.Sheets[sheetName];
            const rawRows: (string | number | null | undefined)[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

            if (!rawRows || rawRows.length === 0) {
                toast({ description: 'No data found in the uploaded file', variant: 'error' });
                setIsLoading(false);
                return;
            }

            // Transform raw rows into structured cohorts
            const parsedCohorts = transformRawData(rawRows);

            // Create a proper CohortType structure
            const newCohort: CohortType = {
                cohortName: "",
                freshman: newSemesterCourses(),
                sophomore: newSemesterCourses(),
                junior: newSemesterCourses(),
                senior: newSemesterCourses()
            };

            // Map parsed cohorts to the newCohort structure
            const entries = Object.entries(parsedCohorts);

            // Helper function to set year data
            const setYear = (idx: number, key: 'freshman' | 'sophomore' | 'junior' | 'senior') => {
                const rec = entries[idx]?.[1];
                if (!rec) return;
                newCohort[key].Fall = Array.isArray(rec.Fall) ? rec.Fall : [];
                newCohort[key].Spring = Array.isArray(rec.Spring) ? rec.Spring : [];
            };

            // Assuming the order is freshman, sophomore, junior, senior
            setYear(0, 'freshman');
            setYear(1, 'sophomore');
            setYear(2, 'junior');
            setYear(3, 'senior');

            setCohort(newCohort);
            setCurrentCohortId(null); // Reset current cohort ID since we're uploading a new one

        } catch (error) {
            console.error('Error reading file:', error);
            toast({ description: 'Failed to process file', variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCohort = async () => {
        if (!cohort) {
            toast({ description: 'Missing cohort data', variant: 'error' });
            return;
        }

        if (!cohort.cohortName.trim()) {
            toast({ description: 'Please provide a cohort name', variant: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            if (!session?.user?.email) {
                toast({ description: 'User email is not available', variant: 'error' });
                return;
            }

            if (!currentDepartment || !currentDepartment._id) {
                toast({ description: 'No department selected. Please select a department first.', variant: 'error' });
                setIsLoading(false);
                return;
            }

            const result = await insertCohort(cohort, currentDepartment._id);
            if (result) {
                toast({ description: 'Cohort saved successfully!', variant: 'success' });

                // Refresh cohorts list
                const updatedCohorts = await loadCohorts(currentDepartment._id, 'true');
                setCohorts(updatedCohorts);

                // Get the current cohort separately to identify which one is current
                const currentCohort = await loadCohorts(currentDepartment._id, 'false');
                if (currentCohort && currentCohort[0] && currentCohort[0]._id) {
                    setCurrentCohortId(currentCohort[0]._id as string);
                }

                setCohort(null); // Reset the cohort state
                setFileName(''); // Clear filename

                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                toast({ description: 'Failed to save cohort', variant: 'error' });
            }
        } catch (error) {
            console.error("Error saving cohort:", error);
            toast({ description: 'An error occurred while saving the cohort', variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Function to start editing a cohort
    const handleEditCohort = (cohort: CohortType) => {
        setEditingCohortId(cohort._id as string);
        setEditNameValue(cohort.cohortName);
    };

    // Function to save edited cohort
    const handleUpdateCohort = async (cohortToUpdate: CohortType) => {
        console.log('Updating cohort:', cohortToUpdate);
        if (!cohortToUpdate || !cohortToUpdate._id) return;

        if (!editNameValue.trim()) {
            toast({ description: 'Please provide a cohort name', variant: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            if (!session?.user?.email) {
                toast({ description: 'User email is not available', variant: 'error' });
                return;
            }

            if (!currentDepartment || !currentDepartment._id) {
                toast({ description: 'No department selected. Please select a department first.', variant: 'error' });
                setIsLoading(false);
                return;
            }

            const updatedCohort = {
                ...cohortToUpdate,
                cohortName: editNameValue
            };

            const result = await updateCohort(updatedCohort._id as string, updatedCohort, currentDepartment._id);

            if (result) {
                toast({ description: 'Cohort updated successfully!', variant: 'success' });

                // Refresh cohorts list
                const updatedCohorts = await loadCohorts(currentDepartment._id, 'true');
                setCohorts(updatedCohorts);

                // Exit edit mode
                setEditingCohortId(null);
            } else {
                toast({ description: 'Failed to update cohort', variant: 'error' });
            }
        } catch (error) {
            console.error("Error updating cohort:", error);
            toast({ description: 'An error occurred while updating the cohort', variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Function to cancel editing
    const handleCancelEdit = () => {
        setEditingCohortId(null);
    };

    const handleDeleteCohort = async (cohortId: string) => {
        if (!session?.user?.email) {
            toast({ description: 'User email is not available', variant: 'error' });
            return;
        }

        if (!currentDepartment || !currentDepartment._id) {
            toast({ description: 'No department selected. Please select a department first.', variant: 'error' });
            return;
        }

        try {
            // Confirm deletion
            const isConfirmed = window.confirm("Are you sure you want to delete this cohort?");
            if (!isConfirmed) return;

            setIsLoading(true);
            // Call the removeCohort function
            await removeCohort(cohortId, currentDepartment._id);

            // Update the cohorts list
            const updatedCohorts = await loadCohorts(currentDepartment._id, 'true');
            setCohorts(updatedCohorts);

            toast({ description: 'Cohort deleted successfully', variant: 'success' });
        } catch (error) {
            console.error("Error deleting cohort:", error);
            toast({ description: 'An error occurred while deleting the cohort', variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    }

    // Helper function to count courses in a cohort
    const countTotalCourses = (cohort: CohortType): number => {
        return [
            ...(cohort.freshman[chosenSemester] || []),
            ...(cohort.sophomore[chosenSemester] || []),
            ...(cohort.junior[chosenSemester] || []),
            ...(cohort.senior[chosenSemester] || [])
        ].length;

    };

    // Add function to set a cohort as current using the generic users endpoint
    const setCurrentCohort = async (cohortId: string) => {
        if (!session?.user?.email) {
            toast({ description: 'User email is not available', variant: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            if (!currentDepartment || !currentDepartment._id) {
                toast({ description: 'No department selected. Please select a department first.', variant: 'error' });
                setIsLoading(false);
                return;
            }

            const result = await setCurrentCohortInDb(cohortId, currentDepartment._id);

            if (result.success) {
                setCurrentCohortId(cohortId);
                toast({ description: 'Current cohort updated successfully', variant: 'success' });
            } else {
                toast({ description: result.message || 'Failed to update current cohort', variant: 'error' });
            }
        } catch (error) {
            console.error("Error updating current cohort:", error);
            toast({ description: 'An error occurred while updating the current cohort', variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    // Different rendering based on whether current department is defined or not

    if (!currentDepartment) {
        // Ask to create department first
        return (
            <div className='flex-1 text-black dark:text-gray-300'>
                <h2 className="text-2xl font-semibold mb-6">Cohorts Settings</h2>
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-800 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-400 flex items-center">Please create and select a department before managing cohorts.
                        <Link href={"/departments"}><MdArrowRightAlt /></Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex-1 text-black dark:text-gray-300'>
            <div className="flex items-center justify-between mb-5">
                {/* Left: Title + Pills */}
                <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-semibold tracking-tight">Cohorts Settings</h2>

                    {/* Pills */}
                    <div className="flex items-center gap-2">
                        {/* Department pill */}
                        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200">
                            <svg
                                className="h-3.5 w-3.5 opacity-70"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10l9 4 9-4V7" />
                            </svg>
                            <span className="truncate max-w-[220px]">
                                Dept: {currentDepartment?.name ?? "—"}
                            </span>
                        </span>

                        {/* Semester segmented pill */}
                        <div className="inline-flex rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-0.5">
                            <button
                                type="button"
                                onClick={() => setChosenSemester('Fall')}
                                className={`px-3 py-1 text-xs rounded-l-full transition
                                    ${chosenSemester === 'Fall'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700'}
                                `}>
                                Fall
                            </button>
                            <button
                                type="button"
                                onClick={() => setChosenSemester('Spring')}
                                className={`px-3 py-1 text-xs rounded-r-full transition
                                    ${chosenSemester === 'Spring'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700'}
                                `}>
                                Spring
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Upload + Save/Cancel */}
                <div className="flex items-center gap-3">
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 dark:border-blue-400" />
                    ) : (
                        <>
                            <label
                                htmlFor="cohort-file"
                                className="flex items-center cursor-pointer bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-md px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                                title="Upload"
                            >
                                <MdFileUpload className="text-blue-600 dark:text-blue-300 mr-2" size={20} />
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-200">
                                    {fileName ? "Change File" : "Upload Cohort"}
                                </span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="cohort-file"
                                    accept=".csv, .xlsx, .xls"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    disabled={isLoading}
                                />
                            </label>

                            {fileName && (
                                <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[140px]">
                                    {fileName}
                                </span>
                            )}

                            {cohort && (
                                <>
                                    <button
                                        onClick={handleSaveCohort}
                                        disabled={isLoading}
                                        className="px-3 py-1.5 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 text-xs font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={isLoading}
                                        className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-600 text-xs font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Display parsed data with improved styling */}
            {cohort && (
                <div className="mt-5 mb-8">
                    <h3 className="text-lg font-medium mb-3">Cohort Preview</h3>
                    <div className="bg-gray-50 dark:bg-zinc-700 rounded-lg shadow-sm overflow-hidden">
                        <div className="p-4 border-b dark:border-zinc-600">
                            <label htmlFor="cohort-name" className="block mb-1 font-medium text-sm text-gray-700 dark:text-gray-300">
                                Cohort Name
                            </label>
                            <input
                                type="text"
                                id="cohort-name"
                                value={cohort.cohortName}
                                onChange={(e) => setCohort({ ...cohort, cohortName: e.target.value })}
                                placeholder="Enter cohort name"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-600 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                            {[
                                { title: 'Freshman', data: cohort.freshman },
                                { title: 'Sophomore', data: cohort.sophomore },
                                { title: 'Junior', data: cohort.junior },
                                { title: 'Senior', data: cohort.senior }
                            ].map((section, idx) => (
                                <div key={section.title} className={`p-4 ${idx < 3 ? 'border-b md:border-b-0 md:border-r dark:border-zinc-600' : ''}`}>
                                    <h4 className="font-semibold text-base mb-2 flex items-center">
                                        {section.title}
                                        <span className="ml-2 bg-gray-200 dark:bg-zinc-600 px-2 py-0.5 rounded-full text-xs">
                                            {section.data[chosenSemester].length}
                                        </span>
                                    </h4>
                                    {section.data[chosenSemester].length > 0 ? (
                                        <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            <ul className="space-y-1">
                                                {section.data[chosenSemester].map((course, i) => (
                                                    <li key={i} className="text-sm py-1 border-b border-gray-100 dark:border-zinc-600 last:border-b-0">
                                                        {course}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No courses</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Display all existing cohorts with card layout */}
            <div className="mt-5">
                <h3 className="text-lg font-medium mb-4">My Cohorts {(!isLoading && cohorts) && "(" + cohorts.length + ")"}</h3>

                {isLoading && !cohort ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 dark:border-blue-400"></div>
                    </div>
                ) : cohorts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cohorts.map((cohort, index) => (
                            <div key={cohort._id || index} className={`bg-white dark:bg-zinc-700 rounded-lg shadow-sm overflow-hidden ${currentCohortId === cohort._id ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}>
                                <div className="p-4 border-b dark:border-zinc-600">
                                    <div className='flex justify-between items-center'>
                                        <div className="w-full">
                                            {editingCohortId === cohort._id ? (
                                                // Editing mode remains unchanged
                                                <div className="flex flex-col space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editNameValue}
                                                        onChange={(e) => setEditNameValue(e.target.value)}
                                                        className="px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-600 text-gray-900 dark:text-gray-100"
                                                        autoFocus
                                                    />
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleUpdateCohort(cohort)}
                                                            disabled={isLoading}
                                                            className="px-3 py-1 text-sm bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
                                                        >
                                                            {isLoading ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="px-3 py-1 text-sm bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-zinc-500"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center">
                                                        <h4 className="font-semibold text-lg">
                                                            {cohort.cohortName || `Cohort ${index + 1}`}
                                                        </h4>
                                                        {currentCohortId === cohort._id && (
                                                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {countTotalCourses(cohort)} courses total
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        {editingCohortId !== cohort._id && (
                                            <div className="flex items-center">
                                                {/* Only show "Set as Current" button if this is not already the current cohort */}
                                                {currentCohortId !== cohort._id && cohort._id && (
                                                    <button
                                                        onClick={() => setCurrentCohort(cohort._id as string)}
                                                        disabled={isLoading}
                                                        className="min-w-fit py-2 px-3 text-xs mr-1.5 rounded text-white bg-green-600 dark:bg-emerald-600 hover:bg-green-700 dark:hover:bg-emerald-500 transition-colors duration-150 font-medium whitespace-nowrap"
                                                        aria-label="Set as current cohort"
                                                    >
                                                        Set as Current
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEditCohort(cohort)}
                                                    disabled={isLoading}
                                                    className="p-2 mr-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-150"
                                                    aria-label="Edit cohort"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                {cohort._id &&
                                                    <button
                                                        onClick={() => handleDeleteCohort(cohort._id as string)}
                                                        disabled={isLoading}
                                                        className="p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-150"
                                                        aria-label="Delete cohort"
                                                    >
                                                        <MdDelete size={20} />
                                                    </button>
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <div className="space-y-3">
                                        <div>
                                            <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">Freshman</h5>
                                            <p className="text-sm line-clamp-2">{cohort.freshman[chosenSemester].length > 0 ?
                                                cohort.freshman[chosenSemester].join(', ') :
                                                <span className="italic text-gray-500 dark:text-gray-400">No courses</span>}
                                            </p>
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">Sophomore</h5>
                                            <p className="text-sm line-clamp-2">{cohort.sophomore[chosenSemester].length > 0 ?
                                                cohort.sophomore[chosenSemester].join(', ') :
                                                <span className="italic text-gray-500 dark:text-gray-400">No courses</span>}
                                            </p>
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">Junior</h5>
                                            <p className="text-sm line-clamp-2">{cohort.junior[chosenSemester].length > 0 ?
                                                cohort.junior[chosenSemester].join(', ') :
                                                <span className="italic text-gray-500 dark:text-gray-400">No courses</span>}
                                            </p>
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">Senior</h5>
                                            <p className="text-sm line-clamp-2">{cohort.senior[chosenSemester].length > 0 ?
                                                cohort.senior[chosenSemester].join(', ') :
                                                <span className="italic text-gray-500 dark:text-gray-400">No courses</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-zinc-700 rounded-lg p-8 text-center">
                        <div className="inline-block p-3 bg-gray-100 dark:bg-zinc-600 rounded-full mb-3">
                            <svg className="h-8 w-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-medium mb-1">No Cohorts Found</h4>
                        <p className="text-gray-600 dark:text-gray-400">Upload a cohort spreadsheet to get started.</p>
                    </div>
                )}
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

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6 bg-transparent dark:text-gray-200">Tags Settings</h2>

            {/* Tag Menu */}
            <div className="flex justify-center pb-4 gap-2">
                <AddTagButton />

                <button
                    className="flex gap-2 items-center justify-center bg-white dark:bg-zinc-700 px-2 shadow-lg border border-gray-300 dark:border-zinc-600 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors duration-150 w-fit text-black dark:text-gray-200"
                    onClick={() => {
                        // Get confirmation from user
                        const isConfirmed = window.confirm("Are you sure you want to unlink all tags from all classes?\n (This will not delete any tags)");
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