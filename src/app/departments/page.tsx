"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MdAdd, MdDelete, MdSearch, MdPeople } from 'react-icons/md';
import { BsCalendarCheck, BsCalendarX } from 'react-icons/bs';
import { DepartmentType } from '@/lib/types';
import Link from 'next/link';
import { deleteDepartment, loadDepartments } from '@/lib/DatabaseUtils';
import { useCalendarContext } from '@/components/CalendarContext/CalendarContext';

export default function DepartmentsPage() {
    const { data: session } = useSession();
    const { setCurrentDepartment, allDepartments } = useCalendarContext();

    // Real data loader
    const [departments, setDepartments] = useState<DepartmentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDepartmentId, setCurrentDepartmentId] = useState<string | null>(null);

    useEffect(() => {
        if (!session?.user?.email) return;

        setIsLoading(true);

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
            .finally(() => setIsLoading(false));
    }, [session?.user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleDeleteDepartment = async (id: string, name: string, length: number) => {
        if (!session?.user?.email) {
            alert('You must be logged in to delete a department.');
            return;
        }

        if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            if (length === 0 || length > 0 && (confirm(`WARNING: You are about to delete ${name} which has ${length} classes. Are you sure?`))) {
                try {
                    const response = await deleteDepartment(id);

                    if (!response) {
                        throw new Error('Failed to delete department');
                    } else {
                        alert(`Department "${name}" deleted successfully.`);
                    }

                    setDepartments(prev => prev.filter(cal => cal._id !== id));
                } catch (err) {
                    console.error("Error deleting department: ", err);
                    alert('Failed to delete department');
                }
            }
        }
    };

    const setCurrDept = (id: string) => {
        console.log("ALL DEPARTMENTS:", allDepartments);
        if (!id || id === "") {
            alert('Invalid department ID');
            console.error('Invalid department ID:', id);
            return;
        }

        const foundDepartment = allDepartments.find(dept => dept._id === id);

        if (!foundDepartment) {
            alert('Department not found');
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

                {isLoading ? (
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
                                                <div className="flex items-center">
                                                    {getDepartmentStatusIcon(department.class_list?.length)}
                                                    <h2 className="text-xl font-semibold ml-2">{department.name}</h2>
                                                    {isCurrent && (
                                                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
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
                                                    {/* <button
                                                        onClick={() => navigateToDepartment(department._id || '')}
                                                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors duration-150"
                                                        aria-label="Open department"
                                                    >
                                                        <MdOpenInNew size={20} />
                                                    </button> */}
                                                    <button
                                                        onClick={() => handleDeleteDepartment(department._id || '', department.name, department.class_list?.length || 0)}
                                                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors duration-150 text-red-500 dark:text-red-400"
                                                        aria-label="Delete department"
                                                    >
                                                        <MdDelete size={20} />
                                                    </button>
                                                </div>
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
