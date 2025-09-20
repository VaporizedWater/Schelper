"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { insertDepartment } from '@/lib/DatabaseUtils';
import { createDepartmentFromInfo } from '@/lib/common';
import { useToast } from '@/components/Toast/Toast';

const CreateDepartmentForm = () => {
    const router = useRouter();
    const { data: session } = useSession();
    const { toast } = useToast();

    const [newDepartmentInfo, setNewDepartmentInfo] = useState<{ name: string }>({
        name: '',
    });
    const [error, setError] = useState('');

    const handleCreateDepartment = async () => {
        if (!newDepartmentInfo.name) {
            setError('Department name is required');
            return;
        }

        if (!session?.user?.email) {
            setError('You must be logged in to create a department');
            return;
        }

        try {
            // create new department
            const createdDepartment = createDepartmentFromInfo(newDepartmentInfo);

            // Call Database util function to save the department
            const response = await insertDepartment(createdDepartment);

            if (!response) {
                toast({ description: 'Failed to create department', variant: 'error' });
                throw new Error('Failed to create department');
            } else {
                toast({ description: 'Department created successfully', variant: 'success' });
            }

            // Return to the previous page
            router.back();
        } catch (err) {
            console.error("Error creating department:", err);
            setError('Failed to create department');
        }
    };

    return (
        <div className="h-full p-4 bg-white dark:bg-zinc-800 text-black dark:text-gray-200">
            <h2 className="text-2xl font-semibold mb-4">Create New Department</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department Name *
                </label>
                <input
                    type="text"
                    value={newDepartmentInfo.name}
                    onChange={(e) => setNewDepartmentInfo({ ...newDepartmentInfo, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Mechanical Engineering"
                    required
                />
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-zinc-500 transition-colors duration-150"
                >
                    Cancel
                </button>
                <button
                    onClick={handleCreateDepartment}
                    className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-150"
                >
                    Create Department
                </button>
            </div>
        </div>
    );
}

export default CreateDepartmentForm;