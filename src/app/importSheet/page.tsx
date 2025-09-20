"use client";

import { useCalendarContext } from '@/components/CalendarContext/CalendarContext';
import { newDefaultEmptyClass } from '@/lib/common';
import { loadCohorts, insertTags, setCurrentCohortInDb } from '@/lib/DatabaseUtils';
import { CohortType, CombinedClass, tagType } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import xlsx from 'xlsx';
import { useSession } from 'next-auth/react';
import DropDown from '@/components/DropDown/DropDown';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';

const convertTime = (excelTime: string): string => {
    const [time, period] = excelTime.split(' ');
    const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));

    let adjustedHours = hours;
    if (period?.toLowerCase() === 'pm' && hours < 12) {
        adjustedHours += 12;
    }

    return `${adjustedHours.toString().padStart(2, '0') || '00'}:${minutes?.toString().padStart(2, '0') || '00'}`;
};

// Extract course level for tagging (e.g., "300" from "300W" becomes "300level")
const extractCourseLevel = (courseNum: string): string | null => {
    const match = courseNum.trim().match(/^(\d+)/);
    if (!match) return null;

    const level = Math.floor(parseInt(match[1], 10) / 100);
    return level >= 1 && level <= 4 ? `${level}00level` : null;
};

const cohortToTag = (cohort: string): string => {
    return cohort.toLowerCase();
};

const isValidCohort = (cohort: CohortType): boolean => {
    if (cohort && cohort.freshman && cohort.sophomore && cohort.junior && cohort.senior) {
        return true;
    } else {
        return false;
    }
}

const assignCohort = (cls: CombinedClass, cohort: CohortType, semester: "Fall" | "Spring"): string | null => {
    // Extract only the numeric portion of the course number
    // const numericPart = cls.data.course_num.match(/^(\d+)/)?.[1] || cls.data.course_num;
    // const courseSubjectNum = cls.data.course_subject.toUpperCase() + " " + numericPart;

    // OR keep the full course number with the letter.
    const courseSubjectNum = cls.data.course_subject.toUpperCase() + " " + cls.data.course_num;

    // If cohort is not valid, return null
    if (!isValidCohort(cohort)) {
        return null;
    }

    // Check if the class 
    if (cohort.freshman[semester].includes(courseSubjectNum)) {
        return "Freshman";
    } else if (cohort.sophomore[semester].includes(courseSubjectNum)) {
        return "Sophomore";
    } else if (cohort.junior[semester].includes(courseSubjectNum)) {
        return "Junior";
    } else if (cohort.senior[semester].includes(courseSubjectNum)) {
        return "Senior";
    }

    return null;
}

const ImportSheet = () => {
    // State to store loaded cohorts
    const { data: session } = useSession();
    const { uploadNewClasses, currentDepartment, currentCalendar } = useCalendarContext();
    const router = useRouter();

    const [allCohorts, setAllCohorts] = useState<CohortType[]>([]);
    const [currentCohortInState, setCurrentCohortInState] = useState<CohortType>({} as CohortType);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [fileName, setFileName] = useState<string>("");
    const [parsedClasses, setParsedClasses] = useState<CombinedClass[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set()); // Use selected classes as initial_state, and then make an initial_state per user. On export, any classes exporting that are not on initial state get everything included.
    const [cohortSelections, setCohortSelections] = useState<Record<string, string>>({});

    const [searchTerm, setSearchTerm] = useState(''); // New search term state

    const [uploadStatus, setUploadStatus] = useState<{
        message: string;
        type: 'success' | 'error' | 'info' | null;
    }>({ message: '', type: null });

    const [uploadOpen, setUploadOpen] = useState(false);

    // New state for parsed + assigned cohort
    const [decoratedClasses, setDecoratedClasses] = useState<
        Array<CombinedClass & { assignedCohort: string | null }>
    >([]);

    const getCurrentSemester = (): "Fall" | "Spring" => {
        return (
            ['FA', 'FALL'].includes(currentCalendar.info.semester.toUpperCase()) ? "Fall" : "Spring"
        );
    }

    useEffect(() => {
        if (!currentCalendar || !currentCalendar.info || !currentCalendar.info.semester) {
            return
        }
        const out = parsedClasses.map(cls => ({
            ...cls,
            assignedCohort: assignCohort(cls, currentCohortInState, getCurrentSemester())
        }));
        setDecoratedClasses(out);

        // Update cohort selections based on current cohort
        setCohortSelections(prev => {
            const updated = { ...prev };
            for (const cls of parsedClasses) {
                const uniqueId = getUniqueClassId(cls);
                if (!updated[uniqueId]) {
                    const assignedCohort = assignCohort(cls, currentCohortInState, getCurrentSemester());
                    if (assignedCohort) {
                        updated[uniqueId] = assignedCohort;
                    }
                }
            }

            return updated;
        })
    }, [parsedClasses, currentCohortInState]); // eslint-disable-line react-hooks/exhaustive-deps

    const isCurrentCohortValid = useMemo(() => isValidCohort(currentCohortInState), [currentCohortInState]);

    // Load cohorts when component mounts
    useEffect(() => {
        if (!session?.user?.email) {
            console.log("No user email found in session.");
            return;
        }

        async function fetchCohorts() {
            if (!session?.user?.email) {
                console.log("No user email found in session.");
                return;
            }

            if (!currentDepartment || currentDepartment?._id === undefined) {
                console.log("No current department found for the user.");
                return;
            }

            const currentCohortResult = await loadCohorts(currentDepartment._id, 'false');

            if (!currentCohortResult || currentCohortResult.length === 0) {
                console.log("No cohorts found for the user.");
                return;
            }

            const allCohortsResult = await loadCohorts(currentDepartment._id, 'true');

            if (!allCohortsResult || allCohortsResult.length === 0) {
                console.log("No all cohorts found for the user.");
                return;
            }

            setAllCohorts(allCohortsResult);
            setCurrentCohortInState(currentCohortResult[0]);
            console.log('Loaded cohorts:', allCohortsResult);
            console.log("Current Cohort Result: ", currentCohortResult[0]);
        }
        fetchCohorts();
    }, [session?.user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

    // Create a unique identifier for each class
    const getUniqueClassId = useCallback((cls: CombinedClass): string => {
        return `${cls.data.class_num}-${cls.data.section}-${cls.properties.room}-${cls.properties.instructor_name}-${cls.properties.days.join(',')}-${cls.properties.start_time}`;
    }, []);

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        // Set loading state and filename
        setIsLoading(true);
        setFileName(selectedFile.name);
        setParsedClasses([]);

        // Process the file immediately
        const data = await selectedFile.arrayBuffer();
        const workbook = xlsx.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Safely parse raw rows (header: 1 → get 2D array)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw: any[][] = xlsx.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
        });

        const headers = raw[1]; // Row 2 (index 1) contains actual column names

        // const rows = xlsx.utils.sheet_to_json(worksheet, { range: 1 }) as object[][];

        const rows = raw.slice(2).filter(row => row.some(cell => String(cell).trim() !== "")); // Remove empty rows

        const combinedClasses = [] as CombinedClass[];

        let dropCount = 0;

        for (const row of rows) {
            const element = Object.fromEntries(
                row.map((cell, i) => [headers[i], cell])
            );

            const combinedClass = newDefaultEmptyClass();
            const classData = combinedClass.data;
            const classProperties = combinedClass.properties;
            let isCancelled = false;

            for (const key in element) {
                const rawValue = String(element[key]);
                if (!rawValue || rawValue.trim() === "") continue;
                const value = rawValue.trim();

                switch (key) {
                    // Class
                    case "Catalog #": classData.catalog_num = value; break;
                    case "Class #": classData.class_num = value; break;
                    case "Session": classData.session = value; break;
                    case "Course": classData.course_subject = value; break;
                    case "Num": classData.course_num = value.trim(); break;
                    case "Section": classData.section = value; break;
                    case "Title": classData.title = value; break;
                    case "Enr Cpcty": classData.enrollment_cap = value; break;
                    case "Wait Cap": classData.waitlist_cap = value; break;

                    // Class Property
                    case "Class Stat":
                        classProperties.class_status = value;

                        if (value === "Cancelled Section") {
                            isCancelled = true;
                        }

                        break;
                    case "Start": classProperties.start_time = convertTime(value); break;
                    case "End": classProperties.end_time = convertTime(value); break;
                    case "Room":
                        classProperties.room = value;

                        if (value === "WEB" || value === "APPT") {
                            isCancelled = true;
                        }

                        break;
                    case "Facility ID":
                        classProperties.facility_id = value;

                        if (value === "WEB" || value === "APPT") {
                            isCancelled = true;
                        }

                        break;
                    case "M":
                        if (value.trim() === "" || value === undefined) {
                            break;
                        }
                        classProperties.days.push("Mon");
                        break;
                    case "T":
                        if (value.trim() === "" || value === undefined) {
                            break;
                        }
                        classProperties.days.push("Tue");
                        break;
                    case "W":
                        if (value.trim() === "" || value === undefined) {
                            break;
                        }
                        classProperties.days.push("Wed");
                        break;
                    case "R":
                        if (value.trim() === "" || value === undefined) {
                            break;
                        }
                        classProperties.days.push("Thu");
                        break;
                    case "F":
                        if (value.trim() === "" || value === undefined) {
                            break;
                        }
                        classProperties.days.push("Fri");
                        break;
                    case "Instructor Email": classProperties.instructor_email = value; break;
                    case "Instructor Name": classProperties.instructor_name = value; break;
                    case "Tot Enrl": classProperties.total_enrolled = value; break;
                    case "Wait Tot": classProperties.total_waitlisted = value; break;
                    default: break;
                }

            };

            // Do not insert class if cancelled (e.g., "Cancelled Section", "WEB")
            // Important to mention that Class ID will contain duplicates if the class is marked as WEB (Web vs Non-Web have the same ID)
            if (!isCancelled) {
                const levelTag = extractCourseLevel(combinedClass.data.course_num);

                if (levelTag) {
                    combinedClass.properties.tags.push({ tagName: levelTag, tagCategory: "level" });
                }

                combinedClasses.push(combinedClass);
            } else {
                console.log(`Skipping cancelled class: ${combinedClass.data.course_subject} ${combinedClass.data.course_num} - Section: ${combinedClass.data.section} - Room: ${combinedClass.properties.room} - Instructor: ${combinedClass.properties.instructor_name} Facility ID: ${combinedClass.properties.facility_id} Class status: ${combinedClass.properties.class_status}`);
                dropCount++;
            }
        };

        console.log(`Dropped ${dropCount} cancelled classes from import.`);

        // After classes are parsed, auto-assign cohorts
        const initialCohortSelections: Record<string, string> = {};

        if (isCurrentCohortValid) {
            combinedClasses.forEach(cls => {
                const uniqueId = getUniqueClassId(cls);
                const suggestedCohort = assignCohort(cls, currentCohortInState, getCurrentSemester());
                if (suggestedCohort) {
                    initialCohortSelections[uniqueId] = suggestedCohort;
                }
            });
        }

        setParsedClasses(combinedClasses);
        // Initially select all classes
        setSelectedClasses(new Set(combinedClasses.map(c => getUniqueClassId(c))));
        setCohortSelections(initialCohortSelections);
        setIsLoading(false);
    }, [currentCohortInState, getUniqueClassId, isCurrentCohortValid]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleImport = useCallback(async () => {
        // Track all unique tags that need to be created
        const tagsToCreate: tagType[] = [];
        const tagTracker = new Map<string, boolean>(); // To avoid duplicates

        const classesToImport = parsedClasses
            .filter(c => selectedClasses.has(getUniqueClassId(c)))
            .map(cls => {
                const uniqueId = getUniqueClassId(cls);
                const selectedCohort = cohortSelections[uniqueId];

                // Remove any existing cohort tags
                const cohortTags = ["freshman", "sophomore", "junior", "senior"];
                const filteredTags = cls.properties.tags.filter(tag => !cohortTags.includes(tag.tagName));

                // Create subject tag if course subject exists
                const updatedTags = [...filteredTags];

                // Helper function to add a tag both to class and our collection list
                const addTag = (tagName: string, tagCategory: string) => {
                    const tag = { tagName, tagCategory } as tagType;
                    updatedTags.push(tag);

                    // Track unique tags for database insertion
                    const key = `${tagName}-${tagCategory}`;
                    if (!tagTracker.has(key)) {
                        tagTracker.set(key, true);
                        tagsToCreate.push(tag);
                    }
                };

                // Add subject tag (e.g., "CS", "MATH")
                if (cls.data.course_subject) {
                    const subjectName = cls.data.course_subject.toLowerCase();
                    addTag(subjectName, "subject");
                }

                // Add room tag if it exists and isn't empty
                if (cls.properties.room && cls.properties.room.trim() !== '') {
                    addTag(cls.properties.room.toLowerCase().replace(/\s+/g, ""), "room");
                }

                // Add instructor tag if it exists and isn't empty
                if (cls.properties.instructor_name && cls.properties.instructor_name.trim() !== '') {
                    addTag(cls.properties.instructor_name.toLowerCase().replace(/\s+/g, ""), "instructor");
                    if (cls.data.course_subject === "EDSGN") {
                        console.log("Added instructor tag:", cls.properties.instructor_name, "to class catalog num", cls.data.class_num);
                    }
                }

                // Add the new cohort tag
                if (!selectedCohort || selectedCohort === "None") {
                    return {
                        ...cls,
                        properties: {
                            ...cls.properties,
                            tags: updatedTags
                        }
                    };
                }

                const newCohortTag = cohortToTag(selectedCohort);
                addTag(newCohortTag, "cohort");

                return {
                    ...cls,
                    properties: {
                        ...cls.properties,
                        cohort: selectedCohort,
                        tags: updatedTags
                    }
                };
            });

        // Create all tags in the database first
        if (tagsToCreate.length > 0) {
            await insertTags(tagsToCreate);
        }

        // Sort by course subject and number, then by section
        classesToImport.sort((a, b) => {
            // Sort by course subject and number, then by section
            if (a.data.course_subject < b.data.course_subject) return -1;
            if (a.data.course_subject > b.data.course_subject) return 1;
            if (a.data.course_num < b.data.course_num) return -1;
            if (a.data.course_num > b.data.course_num) return 1;
            if (a.data.section < b.data.section) return -1;
            if (a.data.section > b.data.section) return 1;
            return 0; // Equal
        });

        // Then upload the classes with tags
        console.log("Uploading classes to import:", classesToImport);

        const ids = parsedClasses.map(getUniqueClassId);
        const uniqueIds = new Set(ids);
        if (uniqueIds.size !== ids.length) {
            console.warn("Duplicate classes detected in import. This may cause issues.");
            const dupes = ids.filter((id, idx) => ids.indexOf(id) !== idx);
            console.log("Duplicates:", [...new Set(dupes)]);
        }

        uploadNewClasses(classesToImport);
        router.back();
    }, [cohortSelections, getUniqueClassId, parsedClasses, router, selectedClasses, uploadNewClasses]);

    // Compute filtered classes by search + current parsing
    const displayedClasses = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return decoratedClasses.filter(cls => {
            // only include if selected and match search
            if (!selectedClasses.has(getUniqueClassId(cls))) return false;
            return [
                `${cls.data.course_subject} ${cls.data.course_num}`,
                cls.data.section,
                cls.data.title,
                cls.properties.instructor_name,
                cls.properties.days.join(', '),
                cls.properties.room,
                cls.data.class_num
            ].some(field => field.toLowerCase().includes(lowerSearch));
        });
    }, [decoratedClasses, searchTerm, selectedClasses, getUniqueClassId]); //eslint-disable-line react-hooks/exhaustive-deps

    // Count auto-assigned in displayed
    const autoAssignedCount = useMemo(() => {
        return decoratedClasses.filter(c => c.assignedCohort).length;
    }, [decoratedClasses]);

    const setCurrentCohort = async (cohortId: string) => {
        if (!session?.user?.email) {
            setUploadStatus({ message: 'User email is not available', type: 'error' });
            setUploadOpen(true);
            return;
        }

        setIsLoading(true);
        try {
            if (!currentDepartment || !currentDepartment._id) {
                setUploadStatus({ message: 'No department selected. Please select a department first.', type: 'error' });
                setUploadOpen(true);
                setIsLoading(false);
                return;
            }

            const result = await setCurrentCohortInDb(cohortId, currentDepartment._id);

            if (result.success) {
                setCurrentCohortInState(allCohorts.find(c => c._id === cohortId) || {} as CohortType);
                setUploadStatus({
                    message: result.modifiedCount && result.modifiedCount > 0
                        ? 'Current cohort updated successfully'
                        : 'This cohort is already set as current',
                    type: 'success'
                });
            } else {
                setUploadStatus({
                    message: result.message || 'Failed to update current cohort',
                    type: 'error'
                });
            }

            setUploadOpen(true);
        } catch (error) {
            console.error("Error updating current cohort:", error);
            setUploadStatus({ message: 'An error occurred while updating the current cohort', type: 'error' });
            setUploadOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="px-4 bg-white dark:bg-zinc-800 h-full w-full text-black dark:text-gray-300 items-center flex flex-col">
            <h1 className="text-2xl font-bold py-2">Import Sheet</h1>

            {/* Status message */}
            {uploadStatus.type && uploadOpen && (
                <div className={`flex items-center gap-2 mb-4 p-3 border rounded-lg ${uploadStatus.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-800 text-green-700 dark:text-green-400' :
                    uploadStatus.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-800 text-red-700 dark:text-red-400' :
                        'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-800 text-blue-700 dark:text-blue-400'
                    }`}>
                    <p>
                        {uploadStatus.message}
                    </p>
                    <button
                        type="button"
                        className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer transition-all duration-100 ease-in-out"
                        onClick={() => setUploadOpen(false)}
                        aria-label="Close modal"
                    >
                        &#x2715;
                    </button>
                </div>
            )}

            <div className="space-y-4">
                <div className=''>
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="cursor-pointer block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus-within:outline-blue-200 focus-within:outline rounded-lg"
                        disabled={isLoading}
                    />
                </div>

                {isLoading && (
                    <div className="mt-4 p-6 flex flex-col items-center justify-center">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 dark:border-blue-400"></div>
                            <span className="text-lg font-medium text-gray-700 dark:text-gray-200">Processing file...</span>
                        </div>
                        {fileName && (
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {fileName}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {!isLoading && parsedClasses.length > 0 && (
                <div className="mt-2 flex flex-col">
                    <div className="flex items-center gap-4 mb-2">
                        <div className='flex items-center gap-2 mb-4'>
                            <h3 className="text-lg font-semibold">Cohort</h3>

                            <DropDown
                                renderButton={(isOpen: boolean) => (
                                    <div
                                        className={`flex items-center gap-1 px-6 py-2 bg-white dark:bg-zinc-800 rounded-lg
                                      hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all duration-200 
                                      shadow-sm hover:shadow border border-gray-200 dark:border-gray-500
                                      ${isOpen ? " " : ""}`}
                                        role="button"
                                        id={`cohort-button`}
                                        aria-haspopup="menu"
                                        aria-expanded={isOpen}
                                        aria-controls={`cohort-menu`}
                                        tabIndex={0}
                                        title={"Cohort Selection"}
                                    >

                                        <span className="text-sm font-medium">{currentCohortInState.cohortName}</span>
                                        {isOpen ? (
                                            <IoMdArrowDropup
                                                className="size-4 text-gray-600 dark:text-gray-400"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <IoMdArrowDropdown
                                                className="size-4 text-gray-600 dark:text-gray-400"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>
                                )
                                }
                                renderDropdown={() => (
                                    <ul
                                        id={`cohort-list-menu`}
                                        role="menu"
                                        aria-labelledby={`cohort-list-button`}
                                        className="w-full rounded-lg shadow-md border border-gray-200 bg-white dark:bg-zinc-800 dark:border-gray-500 overflow-hidden"
                                    >
                                        {allCohorts.filter(c => c._id !== currentCohortInState._id).map((item, idx) => (
                                            <li
                                                key={idx}
                                                role="none"
                                                className={`${idx < allCohorts.length - 1
                                                    ? "border-b border-gray-100 dark:border-gray-500 w-full"
                                                    : ""
                                                    }`}
                                            >
                                                <button
                                                    role="menuitem"
                                                    className="block px-4 py-2 w-full text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors duration-150"
                                                    title={item.cohortName}
                                                    onClick={() => setCurrentCohort(item._id as string)}
                                                >
                                                    {item.cohortName}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )} />
                            {autoAssignedCount > 0 && (
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                    {autoAssignedCount} classes auto-assigned cohorts
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleImport}
                            className="px-4 py-2 ml-auto bg-green-500 dark:bg-green-600 text-white text-md rounded-sm hover:bg-green-600 dark:hover:bg-green-500"
                            data-testid="import-selected-classes"
                        >
                            Import Selected Classes ({selectedClasses.size})
                        </button>
                    </div>

                    {/* New search input */}
                    <div className="mb-4 relative w-full">
                        <input
                            type="text"
                            placeholder="Search imported classes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-3 pr-4 py-2 w-full border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-text transition-colors"
                        />
                    </div>
                    <div className="overflow-auto max-h-[55vh] bg-gray-50 dark:bg-zinc-800">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 dark:bg-zinc-800 sticky top-0">
                                <tr>
                                    <th className="p-2  text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedClasses.size === parsedClasses.length && parsedClasses.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedClasses(new Set(parsedClasses.map(c => getUniqueClassId(c))));
                                                } else {
                                                    setSelectedClasses(new Set());
                                                }
                                                console.log(selectedClasses.size);
                                            }}
                                        />
                                    </th>

                                    <th className="p-2 dark:border-zinc-500 text-left">Course</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Section</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Title</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Instructor</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Start</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">End</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Days</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Room</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Class #</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Cohort</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Classes with auto-assigned cohorts */}
                                {displayedClasses
                                    .filter(cls => cls.assignedCohort && cls.assignedCohort !== "")
                                    .map((cls) => {
                                        const uniqueId = getUniqueClassId(cls);
                                        return (
                                            <tr
                                                key={uniqueId}
                                                onClick={() => { console.log(cls.assignedCohort, "assigned cohort"); }}
                                                className="hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                                            >
                                                <td className="p-2 border dark:border-zinc-700 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedClasses.has(uniqueId)}
                                                        onChange={(e) => {
                                                            const newSelected = new Set(selectedClasses);
                                                            if (e.target.checked) {
                                                                newSelected.add(uniqueId);
                                                            } else {
                                                                newSelected.delete(uniqueId);
                                                            }
                                                            setSelectedClasses(newSelected);
                                                            console.log(selectedClasses.size);
                                                        }}
                                                    />
                                                </td>

                                                <td className="p-2 border dark:border-zinc-700">{cls.data.course_subject} {cls.data.course_num}</td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.data.section}</td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.data.title}</td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.properties.instructor_name}</td>
                                                <td className="p-2 border dark:border-zinc-700">
                                                    {cls.properties.start_time}
                                                </td>
                                                <td className="p-2 border dark:border-zinc-700">
                                                    {cls.properties.end_time}
                                                </td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.properties.days.join(', ')}</td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.properties.room}</td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.data.class_num}</td>
                                                {/* Cohort which is based on selection + cohort list*/}
                                                <td className="p-2 border dark:border-zinc-700 min-w-32">
                                                    <select
                                                        value={cohortSelections[uniqueId] || ''}
                                                        onChange={(e) => {
                                                            setCohortSelections({
                                                                ...cohortSelections,
                                                                [uniqueId]: e.target.value
                                                            });
                                                        }}

                                                        className={`w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isCurrentCohortValid && assignCohort(cls, currentCohortInState, getCurrentSemester()) ? 'bg-blue-50 dark:bg-gray-700' : ''
                                                            }`}
                                                        data-auto-assigned={isCurrentCohortValid && !!assignCohort(cls, currentCohortInState, getCurrentSemester())}
                                                    >
                                                        <option value="None"></option>
                                                        <option value="Freshman">Freshman</option>
                                                        <option value="Sophomore">Sophomore</option>
                                                        <option value="Junior">Junior</option>
                                                        <option value="Senior">Senior</option>
                                                    </select>
                                                    {isCurrentCohortValid && assignCohort(cls, currentCohortInState, getCurrentSemester()) && (
                                                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Auto-assigned</div>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}

                                {/* Classes without autoassigned cohorts */}
                                {displayedClasses
                                    .filter(cls => cls.assignedCohort === "" || cls.assignedCohort === null)
                                    .map((cls) => {
                                        const uniqueId = getUniqueClassId(cls);
                                        return (
                                            <tr
                                                key={uniqueId}
                                                className="hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                                            >
                                                <td className="p-2 border dark:border-zinc-700 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedClasses.has(uniqueId)}
                                                        onChange={(e) => {
                                                            const newSelected = new Set(selectedClasses);
                                                            if (e.target.checked) {
                                                                newSelected.add(uniqueId);
                                                            } else {
                                                                newSelected.delete(uniqueId);
                                                            }
                                                            setSelectedClasses(newSelected);
                                                            console.log(selectedClasses.size);
                                                        }}
                                                    />
                                                </td>

                                                <td className="p-2 border dark:border-zinc-700">
                                                    {cls.data.course_subject} {cls.data.course_num}
                                                </td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.data.section}</td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.data.title}</td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.properties.instructor_name}</td>
                                                <td className="p-2 border dark:border-zinc-700">
                                                    {cls.properties.start_time}
                                                </td>
                                                <td className="p-2 border dark:border-zinc-700">
                                                    {cls.properties.end_time}
                                                </td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.properties.days.join(', ')}</td>

                                                <td className="p-2 border dark:border-zinc-700">{cls.properties.room}</td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.data.class_num}</td>

                                                {/* Cohort which is based on selection + cohort list*/}
                                                <td className="p-2 border dark:border-zinc-700 min-w-32">
                                                    <select
                                                        value={cohortSelections[uniqueId] || ''}
                                                        onChange={(e) => {
                                                            setCohortSelections({
                                                                ...cohortSelections,
                                                                [uniqueId]: e.target.value
                                                            });
                                                        }}

                                                        className={`w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isCurrentCohortValid && assignCohort(cls, currentCohortInState, getCurrentSemester()) ? 'bg-blue-50 dark:bg-gray-700' : ''
                                                            }`}
                                                        data-auto-assigned={isCurrentCohortValid && !!assignCohort(cls, currentCohortInState, getCurrentSemester())}
                                                    >
                                                        <option value="None"></option>
                                                        <option value="Freshman">Freshman</option>
                                                        <option value="Sophomore">Sophomore</option>
                                                        <option value="Junior">Junior</option>
                                                        <option value="Senior">Senior</option>
                                                    </select>
                                                    {isCurrentCohortValid && assignCohort(cls, currentCohortInState, getCurrentSemester()) && (
                                                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Auto-assigned</div>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportSheet;