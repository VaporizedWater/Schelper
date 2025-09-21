"use client";

import { useCalendarContext } from "@/components/CalendarContext/CalendarContext";
import { useConfirm } from "@/components/Confirm/Confirm";
import { useToast } from "@/components/Toast/Toast";
import { newSemesterCourses } from "@/lib/common";
import { insertCohort, loadCohorts, setCurrentCohortInDb, updateCohort } from "@/lib/DatabaseUtils";
import { CohortType } from "@/lib/types";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MdArrowRightAlt, MdDelete, MdFileUpload } from "react-icons/md";
import xlsx, { WorkBook, WorkSheet } from 'xlsx';

export default function CohortSettings() {
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
  const { confirm: confirmDialog } = useConfirm();

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
    setFileName("");
    setCohort(null);
    setEditingCohortId(null);
  };

  const handleDeleteCohort = async (cohortId: string, cohortName: string) => {
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
      const ok = await confirmDialog({
        title: `Delete cohort "${cohortName}"?`,
        description: "Are you sure you want to delete this cohort?",
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "danger",
      });

      if (!ok) return;

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
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="text-yellow-900 dark:text-yellow-200">
            <p className="font-medium">No department selected</p>
            <p className="text-sm opacity-80">Please create and select a department before managing cohorts.</p>
          </div>
          <Link
            href="/departments"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-yellow-100 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-50 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
          >
            Open Departments <MdArrowRightAlt />
          </Link>
        </div>
      </div>
    );
  }

  const totalCohorts = cohorts.length;

  return (
    <div className="p-4 bg-white dark:bg-zinc-800 min-h-screen text-black dark:text-gray-200">
      <div className="max-w-7xl mx-auto">
        {/* Header: title + pills + actions */}
        <div className="flex items-center justify-between mb-6">
          {/* Left: Title + pills */}
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold">Department Cohorts</h1>

            {/* Department pill */}
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
                       bg-blue-50 text-blue-700 border border-blue-200
                       dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800 select-none"
              title="Current Department"
            >
              <svg className="h-3.5 w-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10l9 4 9-4V7" />
              </svg>
              Department: {currentDepartment.name}
            </span>

            {/* Total pill */}
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
                           bg-gray-100 text-gray-700 border border-gray-200
                           dark:bg-zinc-700 dark:text-gray-200 dark:border-zinc-600 select-none">
              Total: {totalCohorts}
            </span>

            {/* Semester segmented pill */}
            <div className="inline-flex rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-0.5">
              <button
                type="button"
                onClick={() => setChosenSemester("Fall")}
                className={`px-3 py-1 text-xs rounded-l-full transition ${chosenSemester === "Fall"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
              >
                Fall
              </button>
              <button
                type="button"
                onClick={() => setChosenSemester("Spring")}
                className={`px-3 py-1 text-xs rounded-r-full transition ${chosenSemester === "Spring"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
              >
                Spring
              </button>
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
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[140px]">{fileName}</span>
                )}

                {cohort && (
                  <>
                    <button
                      onClick={handleSaveCohort}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 text-xs font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Saving..." : "Save"}
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

        {/* Cohort Preview */}
        {cohort && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Cohort Preview</h3>
            <div className="rounded-lg border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-700 shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-100 dark:bg-zinc-600 border-b border-gray-200 dark:border-zinc-600">
                <label htmlFor="cohort-name" className="block mb-1 font-medium text-sm">
                  Cohort Name
                </label>
                <input
                  id="cohort-name"
                  type="text"
                  value={cohort.cohortName}
                  onChange={(e) => setCohort({ ...cohort, cohortName: e.target.value })}
                  placeholder="Enter cohort name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "Freshman", data: cohort.freshman },
                  { title: "Sophomore", data: cohort.sophomore },
                  { title: "Junior", data: cohort.junior },
                  { title: "Senior", data: cohort.senior },
                ].map((section, idx) => (
                  <div
                    key={section.title}
                    className={`p-4 ${idx < 3 ? "border-b md:border-b-0 md:border-r" : ""} border-gray-200 dark:border-zinc-600`}
                  >
                    <h4 className="font-semibold text-sm mb-2 flex items-center">
                      {section.title}
                      <span className="ml-2 bg-gray-200 dark:bg-zinc-600 px-2 py-0.5 rounded-full text-xs">
                        {section.data[chosenSemester].length}
                      </span>
                    </h4>
                    {section.data[chosenSemester].length > 0 ? (
                      <div className="max-h-56 overflow-y-auto pr-1">
                        <ul className="space-y-1">
                          {section.data[chosenSemester].map((course, i) => (
                            <li key={i} className="text-sm py-1 border-b border-gray-100 dark:border-zinc-600 last:border-b-0">
                              {course}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-300 italic">No courses</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Existing cohorts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">My Cohorts</h3>
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
              {totalCohorts} total
            </span>
          </div>

          {isLoading && !cohort ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 dark:border-blue-400" />
            </div>
          ) : cohorts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cohorts.map((c, index) => {
                const isCurrent = currentCohortId === c._id;
                return (
                  <div
                    key={c._id || index}
                    className={`bg-gray-50 dark:bg-zinc-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-zinc-600 ${isCurrent ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""
                      }`}
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-zinc-600">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          {editingCohortId === c._id ? (
                            <div className="flex flex-col gap-2">
                              <input
                                type="text"
                                value={editNameValue}
                                onChange={(e) => setEditNameValue(e.target.value)}
                                className="px-2 py-1 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateCohort(c)}
                                  disabled={isLoading}
                                  className="px-3 py-1 text-sm bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
                                >
                                  {isLoading ? "Saving..." : "Save"}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-lg truncate">{c.cohortName || `Cohort ${index + 1}`}</h4>
                                {isCurrent && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {countTotalCourses(c)} courses total
                              </p>
                            </>
                          )}
                        </div>

                        {editingCohortId !== c._id && (
                          <div className="flex items-center">
                            {currentCohortId !== c._id && c._id && (
                              <button
                                onClick={() => setCurrentCohort(c._id as string)}
                                disabled={isLoading}
                                className="min-w-fit py-2 px-3 text-xs mr-1.5 rounded text-white bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors font-medium whitespace-nowrap"
                                aria-label="Set as current cohort"
                              >
                                Set as Current
                              </button>
                            )}
                            <button
                              onClick={() => handleEditCohort(c)}
                              disabled={isLoading}
                              className="p-2 mr-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                              aria-label="Edit cohort"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            {c._id && (
                              <button
                                onClick={() => handleDeleteCohort(c._id as string, c.cohortName)}
                                disabled={isLoading}
                                className="p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                aria-label="Delete cohort"
                              >
                                <MdDelete size={20} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { label: "Freshman", list: c.freshman[chosenSemester] },
                          { label: "Sophomore", list: c.sophomore[chosenSemester] },
                          { label: "Junior", list: c.junior[chosenSemester] },
                          { label: "Senior", list: c.senior[chosenSemester] },
                        ].map(({ label, list }) => (
                          <div key={label}>
                            <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">{label}</h5>
                            <p className="text-sm line-clamp-2">
                              {list.length > 0 ? (
                                <span>{list.join(", ")}</span>
                              ) : (
                                <span className="italic text-gray-500 dark:text-gray-400">No courses</span>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-zinc-700 rounded-lg p-8 text-center border border-gray-200 dark:border-zinc-600">
              <div className="inline-block p-3 bg-gray-100 dark:bg-zinc-600 rounded-full mb-3">
                <svg className="h-8 w-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0116 9v10a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium mb-1">No Cohorts Found</h4>
              <p className="text-gray-600 dark:text-gray-400">Upload a cohort spreadsheet to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

}