"use client";

import { useEffect, useState } from 'react';
import { MdDelete, MdAdd, MdSearch, MdFilterList } from 'react-icons/md';
import Image from 'next/image';

// Professor type definition
interface Professor {
    id: string;
    name: string;
    email: string;
    department: string;
    office: string;
    officeHours?: string;
    phone?: string;
    subjects?: string[];
    imageUrl?: string;
}

export default function ProfessorsPage() {
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProfessor, setNewProfessor] = useState<Partial<Professor>>({
        name: '',
        email: '',
        department: '',
        office: '',
    });
    const [filter, setFilter] = useState('all');

    // Mock data for demonstration
    useEffect(() => {
        // This would be replaced with an actual API call
        const mockProfessors: Professor[] = [
            {
                id: '1',
                name: 'Dr. Jane Smith',
                email: 'jane.smith@psu.edu',
                department: 'Computer Science',
                office: 'IST 101',
                officeHours: 'Mon/Wed 2-4pm',
                phone: '555-123-4567',
                subjects: ['Programming', 'Algorithms', 'Data Structures'],
                imageUrl: 'https://i.pravatar.cc/150?img=1'
            },
            {
                id: '2',
                name: 'Prof. John Doe',
                email: 'john.doe@psu.edu',
                department: 'Computer Science',
                office: 'IST 204',
                officeHours: 'Tue/Thu 1-3pm',
                subjects: ['Machine Learning', 'AI'],
                imageUrl: 'https://i.pravatar.cc/150?img=2'
            },
            {
                id: '3',
                name: 'Dr. Mary Johnson',
                email: 'mary.johnson@psu.edu',
                department: 'Electrical Engineering',
                office: 'EE 305',
                officeHours: 'Fri 10am-12pm',
                phone: '555-987-6543',
                subjects: ['Circuit Analysis', 'Digital Logic'],
                imageUrl: 'https://i.pravatar.cc/150?img=3'
            }
        ];

        setTimeout(() => {
            setProfessors(mockProfessors);
            setIsLoading(false);
        }, 500); // Simulate loading
    }, []);

    // Filter and search function
    const filteredProfessors = professors.filter(professor => {
        const matchesSearch =
            professor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            professor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            professor.department.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'all') return matchesSearch;
        return matchesSearch && professor.department === filter;
    });

    // Get unique departments for filter
    const departments = ['all', ...new Set(professors.map(p => p.department))];

    const handleAddProfessor = () => {
        if (!newProfessor.name || !newProfessor.email || !newProfessor.department) {
            alert('Please fill in all required fields');
            return;
        }

        const professorToAdd: Professor = {
            id: Date.now().toString(), // Would be replaced with a proper ID from the backend
            name: newProfessor.name,
            email: newProfessor.email,
            department: newProfessor.department,
            office: newProfessor.office || '',
            officeHours: newProfessor.officeHours,
            phone: newProfessor.phone,
            subjects: newProfessor.subjects || [],
        };

        setProfessors([...professors, professorToAdd]);
        setNewProfessor({
            name: '',
            email: '',
            department: '',
            office: '',
        });
        setShowAddModal(false);
    };

    const handleDeleteProfessor = (id: string) => {
        if (confirm('Are you sure you want to remove this professor?')) {
            setProfessors(professors.filter(prof => prof.id !== id));
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-zinc-800 min-h-screen text-black dark:text-gray-200">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Department Professors</h1>

                {/* Search and filter bar */}
                <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                    <div className="relative flex-grow max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MdSearch className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search professors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="relative">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdFilterList className="text-gray-500 dark:text-gray-400" />
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-150"
                        >
                            <MdAdd /> Add Professor
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 dark:border-blue-400"></div>
                    </div>
                ) : filteredProfessors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProfessors.map((professor) => (
                            <div
                                key={professor.id}
                                className="bg-gray-50 dark:bg-zinc-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="p-5 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center">
                                            {professor.imageUrl ? (
                                                <Image
                                                    src={professor.imageUrl}
                                                    alt={professor.name}
                                                    className="w-12 h-12 rounded-full object-cover mr-4"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-4">
                                                    <span className="text-blue-800 dark:text-blue-200 text-lg font-semibold">
                                                        {professor.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <h2 className="text-xl font-semibold">{professor.name}</h2>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{professor.department}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteProfessor(professor.id)}
                                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            aria-label="Delete professor"
                                        >
                                            <MdDelete size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-2 flex-grow">
                                        <p className="text-sm flex">
                                            <span className="font-medium w-24">Email:</span>
                                            <a href={`mailto:${professor.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                                {professor.email}
                                            </a>
                                        </p>
                                        <p className="text-sm flex">
                                            <span className="font-medium w-24">Office:</span>
                                            <span>{professor.office}</span>
                                        </p>
                                        {professor.officeHours && (
                                            <p className="text-sm flex">
                                                <span className="font-medium w-24">Office Hours:</span>
                                                <span>{professor.officeHours}</span>
                                            </p>
                                        )}
                                        {professor.phone && (
                                            <p className="text-sm flex">
                                                <span className="font-medium w-24">Phone:</span>
                                                <span>{professor.phone}</span>
                                            </p>
                                        )}
                                    </div>

                                    {professor.subjects && professor.subjects.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium mb-1">Subjects:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {professor.subjects.map((subject, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-md text-xs"
                                                    >
                                                        {subject}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            No professors found matching your search criteria.
                        </p>
                    </div>
                )}
            </div>

            {/* Add Professor Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Add New Professor</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newProfessor.name}
                                        onChange={(e) => setNewProfessor({ ...newProfessor, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={newProfessor.email}
                                        onChange={(e) => setNewProfessor({ ...newProfessor, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Department *
                                    </label>
                                    <input
                                        type="text"
                                        value={newProfessor.department}
                                        onChange={(e) => setNewProfessor({ ...newProfessor, department: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Office *
                                    </label>
                                    <input
                                        type="text"
                                        value={newProfessor.office}
                                        onChange={(e) => setNewProfessor({ ...newProfessor, office: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Office Hours
                                    </label>
                                    <input
                                        type="text"
                                        value={newProfessor.officeHours || ''}
                                        onChange={(e) => setNewProfessor({ ...newProfessor, officeHours: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. Mon/Wed 2-4pm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={newProfessor.phone || ''}
                                        onChange={(e) => setNewProfessor({ ...newProfessor, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-black dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. 555-123-4567"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-zinc-500 transition-colors duration-150"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddProfessor}
                                    className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-150"
                                >
                                    Add Professor
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
