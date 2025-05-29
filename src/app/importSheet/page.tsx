"use client";

import { useCalendarContext } from '@/components/CalendarContext/CalendarContext';
import { newDefaultEmptyClass } from '@/lib/common';
import { loadCohorts, insertTags } from '@/lib/DatabaseUtils';
import { CohortType, CombinedClass, tagType } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import xlsx from 'xlsx';
import { useSession } from 'next-auth/react';

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

const assignCohort = (cls: CombinedClass, cohort: CohortType): string | null => {
    // Extract only the numeric portion of the course number
    // const numericPart = cls.data.course_num.match(/^(\d+)/)?.[1] || cls.data.course_num;
    // const courseSubjectNum = cls.data.course_subject.toUpperCase() + " " + numericPart;

    // OR keep the full course number with the letter.
    const courseSubjectNum = cls.data.course_subject.toUpperCase() + " " + cls.data.course_num;

    // Check if the class 
    if (cohort.freshman.includes(courseSubjectNum)) {
        return "Freshman";
    } else if (cohort.sophomore.includes(courseSubjectNum)) {
        return "Sophomore";
    } else if (cohort.junior.includes(courseSubjectNum)) {
        return "Junior";
    } else if (cohort.senior.includes(courseSubjectNum)) {
        return "Senior";
    }

    return null;
}

const ImportSheet = () => {
    // State to store loaded cohorts
    const { data: session } = useSession();
    const [currentCohort, setCurrentCohort] = useState<CohortType>({} as CohortType);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [fileName, setFileName] = useState<string>("");

    const isCurrentCohortValid = useMemo(() => isValidCohort(currentCohort), [currentCohort]);

    // Load cohorts when component mounts
    useEffect(() => {
        async function fetchCohorts() {
            const result = await loadCohorts(session?.user?.email || '', 'false');

            if (!result || result.length === 0) {
                console.log("No cohorts found for the user.");
                return;
            }

            setCurrentCohort(result[0]);
            console.log('Loaded cohort:', result);
            console.log("RESULT 0", result[0]);
        }
        fetchCohorts();
    }, [session?.user?.email]);

    const router = useRouter();
    const { uploadNewClasses } = useCalendarContext();
    const [parsedClasses, setParsedClasses] = useState<CombinedClass[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set()); // Use selected classes as initial_state, and then make an initial_state per user. On export, any classes exporting that are not on initial state get everything included.
    const [cohortSelections, setCohortSelections] = useState<Record<string, string>>({});

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
        const rows = xlsx.utils.sheet_to_json(worksheet, { range: 1 }) as object[][];

        const combinedClasses = [] as CombinedClass[];

        rows.values().forEach((element: object[]) => {
            const combinedClass = newDefaultEmptyClass();
            const classData = combinedClass.data;
            const classProperties = combinedClass.properties;
            let isCancelled = false;

            Object.keys(element).forEach(key => {
                if (isCancelled) {
                    return;
                }
                const value = String(element[key as keyof typeof element]);
                if (value) {
                    switch (key) {
                        // Class
                        case "Catalog #":
                            classData.catalog_num = value;
                            break;
                        case "Class #":
                            classData.class_num = value;
                            break;
                        case "Session":
                            classData.session = value;
                            break;
                        case "Course":
                            classData.course_subject = value;
                            break;
                        case "Num":
                            const val = value.trim();
                            const match = val.match(/^\d+/);
                            if (match) {
                                const numbers = Number(match);
                                if (!isNaN(numbers)) {
                                    switch (Math.floor(numbers / 100)) {
                                        case 1:
                                            classProperties.tags.push({ tagName: "100level", tagCategory: "level" });
                                            break;
                                        case 2:
                                            classProperties.tags.push({ tagName: "200level", tagCategory: "level" });
                                            break;
                                        case 3:
                                            classProperties.tags.push({ tagName: "300level", tagCategory: "level" });
                                            break;
                                        case 4:
                                            classProperties.tags.push({ tagName: "400level", tagCategory: "level" });
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }
                            classData.course_num = val;
                            break;
                        case "Section":
                            classData.section = value;
                            break;
                        case "Title":
                            classData.title = value;
                            break;
                        case "Enr Cpcty":
                            classData.enrollment_cap = value;
                            break;
                        case "Wait Cap":
                            classData.waitlist_cap = value;
                            break;

                        // Class Property
                        case "Class Stat":
                            classProperties.class_status = value;

                            if (value === "Cancelled Section") {
                                isCancelled = true;
                            }

                            break;
                        case "Start":
                            classProperties.start_time = convertTime(value);
                            break;
                        case "End":
                            classProperties.end_time = convertTime(value);
                            break;
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
                        case "Instructor Email":
                            classProperties.instructor_email = value;
                            break;
                        case "Instructor Name":
                            classProperties.instructor_name = value;
                            break;
                        case "Tot Enrl":
                            classProperties.total_enrolled = value;
                            break;
                        case "Wait Tot":
                            classProperties.total_waitlisted = value;
                            break;
                        default:
                            break;
                    }
                }
            });

            // Do not insert class if cancelled (e.g., "Cancelled Section", "WEB")
            // Important to mention that Class ID will contain duplicates if the class is marked as WEB (Web vs Non-Web have the same ID)
            if (!isCancelled) {
                const levelTag = extractCourseLevel(combinedClass.data.course_num);

                if (levelTag) {
                    combinedClass.properties.tags.push({ tagName: levelTag, tagCategory: "level" });
                }

                combinedClasses.push(combinedClass);
            }
        });

        // After classes are parsed, auto-assign cohorts
        const initialCohortSelections: Record<string, string> = {};

        if (isCurrentCohortValid) {
            combinedClasses.forEach(cls => {
                const uniqueId = getUniqueClassId(cls);
                const suggestedCohort = assignCohort(cls, currentCohort);
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
    }, [currentCohort, getUniqueClassId, isCurrentCohortValid]);

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
        uploadNewClasses(classesToImport);
        router.back();
    }, [cohortSelections, getUniqueClassId, parsedClasses, router, selectedClasses, uploadNewClasses]);

    const autoAssignedCount = (isCurrentCohortValid) ? parsedClasses.filter(cls =>
        assignCohort(cls, currentCohort) !== null).length
        : 0;

    return (
        <div className="p-4 bg-white dark:bg-zinc-800 h-full w-full text-black dark:text-gray-300">
            <h1 className="text-2xl font-bold mb-4 ">Import Sheet</h1>
            <div className="space-y-4">
                <div className=''>
                    <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-semibold">Classes to Import ({selectedClasses.size})</h2>
                            {autoAssignedCount > 0 && (
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                    {autoAssignedCount} classes with auto-assigned cohorts
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleImport}
                            className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-sm hover:bg-green-600 dark:hover:bg-green-500"
                            data-testid="import-selected-classes"
                        >
                            Import Selected Classes ({selectedClasses.size})
                        </button>
                    </div>
                    <div className="overflow-auto max-h-[50vh] bg-gray-50 dark:bg-zinc-800">
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
                                    <th className="p-2 dark:border-zinc-500 text-left">Class #</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Course</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Title</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Days</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Start</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">End</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Instructor</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Room</th>
                                    <th className="p-2 dark:border-zinc-500 text-left">Cohort</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Classes with auto-assigned cohorts */}
                                {parsedClasses
                                    .filter(cls => assignCohort(cls, currentCohort))
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
                                                <td className="p-2 border dark:border-zinc-700">{cls.data.class_num}</td>
                                                <td className="p-2 border dark:border-zinc-700">
                                                    {cls.data.course_subject} {cls.data.course_num}
                                                </td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.data.title}</td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.properties.days.join(', ')}</td>
                                                <td className="p-2 border dark:border-zinc-700">
                                                    {cls.properties.start_time}
                                                </td>
                                                <td className="p-2 border dark:border-zinc-700">
                                                    {cls.properties.end_time}
                                                </td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.properties.instructor_name}</td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.properties.room}</td>

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

                                                        className={`w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isCurrentCohortValid && assignCohort(cls, currentCohort) ? 'bg-blue-50 dark:bg-gray-700' : ''
                                                            }`}
                                                        data-auto-assigned={isCurrentCohortValid && !!assignCohort(cls, currentCohort)}
                                                    >
                                                        <option value="None"></option>
                                                        <option value="Freshman">Freshman</option>
                                                        <option value="Sophomore">Sophomore</option>
                                                        <option value="Junior">Junior</option>
                                                        <option value="Senior">Senior</option>
                                                    </select>
                                                    {isCurrentCohortValid && assignCohort(cls, currentCohort) && (
                                                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Auto-assigned</div>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}

                                {/* Classes without autoassigned cohorts */}
                                {parsedClasses
                                    .filter(cls => !assignCohort(cls, currentCohort))
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
                                                <td className="p-2 border dark:border-zinc-700">{cls.data.class_num}</td>
                                                <td className="p-2 border dark:border-zinc-700">
                                                    {cls.data.course_subject} {cls.data.course_num}
                                                </td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.data.title}</td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.properties.days.join(', ')}</td>
                                                <td className="p-2 border dark:border-zinc-700">
                                                    {cls.properties.start_time}
                                                </td>
                                                <td className="p-2 border dark:border-zinc-700">
                                                    {cls.properties.end_time}
                                                </td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.properties.instructor_name}</td>
                                                <td className="p-2 border dark:border-zinc-700">{cls.properties.room}</td>

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

                                                        className={`w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isCurrentCohortValid && assignCohort(cls, currentCohort) ? 'bg-blue-50 dark:bg-gray-700' : ''
                                                            }`}
                                                        data-auto-assigned={isCurrentCohortValid && !!assignCohort(cls, currentCohort)}
                                                    >
                                                        <option value="None"></option>
                                                        <option value="Freshman">Freshman</option>
                                                        <option value="Sophomore">Sophomore</option>
                                                        <option value="Junior">Junior</option>
                                                        <option value="Senior">Senior</option>
                                                    </select>
                                                    {isCurrentCohortValid && assignCohort(cls, currentCohort) && (
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