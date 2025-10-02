"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MdAdd, MdDelete, MdSearch, MdPeople } from 'react-icons/md';
import { BsCalendarCheck, BsCalendarX } from 'react-icons/bs';
import { DepartmentType } from '@/lib/types';
import Link from 'next/link';
import { deleteDepartment, loadDepartments } from '@/lib/DatabaseUtils';
import { useCalendarContext } from '@/components/CalendarContext/CalendarContext';
import { useToast } from '@/components/Toast/Toast';
import { useConfirm } from '@/components/Confirm/Confirm';

export default function DepartmentsPage() {
    const { data: session } = useSession();
    const { setCurrentDepartment, allDepartments, currentDepartment, isLoading, renameDepartment } = useCalendarContext();
    const { toast } = useToast();
    const { confirm: confirmDialog } = useConfirm();

    // Real data loader
    const [departments, setDepartments] = useState<DepartmentType[]>([]);
    const [isBusy, setIsBusy] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDepartmentId, setCurrentDepartmentId] = useState<string | null>(null);
    const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
    const [editNameValue, setEditNameValue] = useState<string>('');

    useEffect(() => {
        if (!session?.user?.email) return;

        setIsBusy(true);

        loadDepartments()
            .then(({ current, all: list }) => {
                console.log("Loaded departments:", list, "Current:", current);
                setDepartments(list);

                // Set current department id from loaded data
                if (current && current._id) {
                    setCurrentDepartmentId(current._id);
                }
            })
            .catch(err => {
                console.error("Error loading departments:", err);
            })
            .finally(() => setIsBusy(false));
    }, [session?.user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

    // 🔁 Keep local departments in sync with context whenever it changes
    useEffect(() => {
        if (Array.isArray(allDepartments)) {
            setDepartments(allDepartments);
        }
    }, [allDepartments]);

    // 🔁 Keep the local "current" id in sync with context currentDepartment
    useEffect(() => {
        setCurrentDepartmentId(currentDepartment?._id ?? null);
    }, [currentDepartment?._id]);

    const handleEditDepartment = (dept: DepartmentType) => {
        if (!dept?._id) return;
        setEditingDepartmentId(dept._id);
        setEditNameValue(dept.name || '');
    };

    const handleCancelEdit = () => {
        setEditingDepartmentId(null);
        setEditNameValue('');
    };

    const handleUpdateDepartment = async (dept: DepartmentType) => {
        if (!dept?._id) return;
        const next = editNameValue.trim();
        if (!next) {
            toast({ description: 'Please provide a department name', variant: 'error' });
            return;
        }
        setIsBusy(true);
        try {
            const ok = await renameDepartment(dept._id as string, next);
            if (!ok) {
                toast({ description: 'Failed to update department', variant: 'error' });
                return;
            }
            // keep local list in sync immediately (also covered by context sync)
            setDepartments(prev => prev.map(d => (d._id === dept._id ? { ...d, name: next } : d)));
            setEditingDepartmentId(null);
            toast({ description: 'Department updated successfully!', variant: 'success' });
        } catch (e) {
            console.error('Error updating department:', e);
            toast({ description: 'An error occurred while updating the department', variant: 'error' });
        } finally {
            setIsBusy(false);
        }
    };

    const handleDeleteDepartment = async (id: string, name: string, length: number) => {
        if (!session?.user?.email) {
            toast({ description: 'You must be logged in to delete a department.', variant: 'error' });
            return;
        }

        const okPrimary = await confirmDialog({
            title: "Delete department?",
            description: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "danger",
        });
        if (!okPrimary) return;

        if (length > 0) {
            const okWarn = await confirmDialog({
                title: "Warning",
                description: `You are about to delete "${name}" which has ${length} classes. Are you sure?`,
                confirmText: "Delete anyway",
                cancelText: "Keep department",
                variant: "danger",
            });
            if (!okWarn) return;
        }

        try {
            const response = await deleteDepartment(id);

            if (!response) {
                throw new Error("Failed to delete department");
            } else {
                toast({ description: `Department "${name}" deleted successfully.`, variant: "success" });
            }

            setDepartments((prev) => prev.filter((cal) => cal._id !== id));

            if (currentDepartmentId === id) {
                setCurrentDepartmentId(null);
            }
        } catch (err) {
            console.error("Error deleting department: ", err);
            toast({ description: "Failed to delete department", variant: "error" });
        }
    };

    const setCurrDept = (id: string) => {
        if (!id || id === "") {
            toast({ description: 'Invalid department ID', variant: 'error' });
            console.error('Invalid department ID:', id);
            return;
        }

        const foundDepartment = departments.find(dept => dept._id === id);

        if (!foundDepartment) {
            toast({ description: 'Department not found', variant: 'error' });
            console.error('Department not found for ID:', id);
            return;
        }

        // // Update state
        setCurrentDepartmentId(id);

        // Update context
        setCurrentDepartment(foundDepartment);
    }

    const getDepartmentStatusIcon = (classCount: number | undefined) => {
        if (!classCount) return <MdPeople className="text-gray-400" size={20} />;
        if (classCount > 25) return <BsCalendarCheck className="text-green-500" size={20} />;
        return <BsCalendarX className="text-orange-500" size={20} />;
    };

    // Filter departments by name based on searchTerm
    const filteredDepartments = departments?.length > 0 ? departments.filter(department => {
        const name = department.name || '';
        const search = searchTerm.toLowerCase();
        return name.toLowerCase().includes(search);
    }) : [];

    return (
        <div className="p-6 bg-white dark:bg-zinc-800 min-h-screen text-black dark:text-gray-200">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-4 mb-8">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold">My Departments</h1>
                        {/* Search bar for semesters */}
                        <div className="relative mt-2 w-full flex">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdSearch className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex items-end md:items-end">
                        <Link
                            href="/createDepartment"
                            className="flex items-center gap-2 px-4 py-2.25 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-150"
                        >
                            <MdAdd /> Create Department
                        </Link>
                    </div>
                </div>

                {isLoading || isBusy ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 dark:border-blue-400"></div>
                    </div>
                ) : (!departments || departments.length === 0) ? (
                    // No departments exist case (unchanged)
                    <div className="bg-gray-50 dark:bg-zinc-700 rounded-lg p-8 text-center">
                        <div className="inline-block p-4 bg-gray-100 dark:bg-zinc-600 rounded-full mb-4">
                            <MdPeople className="text-gray-400 dark:text-gray-300" size={48} />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No Departments Found</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            You don&apos;t have any departments yet. Get started by creating your first department.
                        </p>
                        <Link
                            href="/createDepartment"
                            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-150"
                        >
                            Create Your First Department
                        </Link>
                    </div>
                ) : filteredDepartments.length === 0 ? (
                    // No search results case (new)
                    <div className="bg-gray-50 dark:bg-zinc-700 rounded-lg p-8 text-center">
                        <div className="inline-block p-4 bg-gray-100 dark:bg-zinc-600 rounded-full mb-4">
                            <MdSearch className="text-gray-400 dark:text-gray-300" size={48} />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No Results</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            No departments match your search. Try a different name.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDepartments
                            .filter(department => (department._id !== null))
                            .sort((a, b) => {
                                // Sort by name (ascending)
                                const nameA = a.name;
                                const nameB = b.name;

                                if (nameA !== nameB) {
                                    return nameA.localeCompare(nameB);
                                }

                                // If name is the same, sort by class list length descending
                                return (b.class_list.length || 0) - (a.class_list.length || 0);
                            })
                            .map((department) => {
                                // Use local state for current department highlight
                                const isCurrent = (currentDepartmentId === department._id);
                                const isEditing = editingDepartmentId === department._id;
                                return (
                                    <div
                                        key={department._id}
                                        className={
                                            "bg-gray-50 dark:bg-zinc-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300" +
                                            (isCurrent ? " ring-2 ring-blue-500 dark:ring-blue-400" : "")
                                        }
                                    >
                                        <div className="p-5 flex flex-col h-full">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-start gap-2 min-w-0">
                                                    {getDepartmentStatusIcon(department.class_list?.length)}
                                                    <div className="min-w-0">
                                                        {isEditing ? (
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
                                                                        onClick={() => handleUpdateDepartment(department)}
                                                                        disabled={isBusy || editNameValue.trim() === department.name}
                                                                        className="px-3 py-1 text-sm bg-blue-600 dark:bg-blue-700 text-white disabled:text-gray-500 disabled:dark:text-gray-400 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-200 disabled:dark:bg-zinc-600"
                                                                    >
                                                                        {isBusy ? 'Saving...' : 'Save'}
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
                                                            <div className="flex items-center gap-2">
                                                                <h2 className="text-xl font-semibold truncate">{department.name}</h2>
                                                                {isCurrent && (
                                                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                                                        Current
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {!isEditing && (
                                                    <div className="flex space-x-1 items-center">
                                                        {!isCurrent && (
                                                            <button
                                                                onClick={() => (department._id) ? setCurrDept(department._id) : null}
                                                                className="py-2 px-3 text-xs rounded text-white bg-green-600 dark:bg-emerald-600 hover:bg-green-700 dark:hover:bg-emerald-500 transition-colors duration-150 font-medium whitespace-nowrap"
                                                                aria-label="Set as current department"
                                                            >
                                                                Set as Current
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEditDepartment(department)}
                                                            disabled={isBusy}
                                                            className="p-2 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                                            aria-label="Edit department"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteDepartment(department._id || '', department.name, department.class_list?.length || 0)}
                                                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors duration-150 text-red-500 dark:text-red-400"
                                                            aria-label="Delete department"
                                                        >
                                                            <MdDelete size={20} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-auto space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Classes:</span>
                                                    <span className="font-medium">{department.class_list?.length || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Faculty:</span>
                                                    <span className="font-medium">{department.faculty_list?.length || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Cohorts:</span>
                                                    <span className="font-medium">{department.cohorts.length}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Last modified:</span>
                                                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>
        </div>
    );
}
