"use client"

import { useState } from "react";
import Filters from "../Filters/Filters";
import ClassProperties from "../ClassProperties/ClassProperties";
import { FaClock, FaFilter, FaListUl, FaTag } from "react-icons/fa";
import Tags from "../Tags/Tags";
import DeleteClass from "../DeleteClass/DeleteClass";
import { MdDelete, MdWarning } from "react-icons/md";
import ClassTimeProperties from "../ClassTimeProperties/ClassTimeProperties";
import ConflictProperties from "../ConflictProperties/ConflictProperties";

const LeftMenu = () => {
    const [activeComponent, setActiveComponent] = useState<'filters' | 'properties' | 'timeProperties' | 'tags' | 'conflicts' | 'delete'>('filters');

    const menuItems: {
        key: typeof activeComponent;
        label: string;
        icon: React.ReactNode;
    }[] = [
            { key: 'filters', label: 'Filters', icon: <FaFilter size={14} /> },
            { key: 'properties', label: 'Class Properties', icon: <FaListUl size={14} /> },
            { key: 'timeProperties', label: 'Time Properties', icon: <FaClock size={14} /> },
            { key: 'tags', label: 'Tags', icon: <FaTag size={14} /> },
            { key: 'conflicts', label: 'Conflicts', icon: <MdWarning size={14} /> },
            { key: 'delete', label: 'Delete Class', icon: <MdDelete size={14} /> },
        ];

    return (
        <div className="flex h-full">
            {/* Icon sidebar */}
            <nav
                className="flex-none flex flex-col py-4 bg-gray-100 dark:bg-dark border-r border-gray-300 dark:border-gray-600 w-12"
                role="toolbar"
                aria-label="Main menu"
            >
                {menuItems.map(item => (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => setActiveComponent(item.key)}
                        className={`p-2 mb-2 cursor-pointer flex justify-center items-center rounded-md mx-2 transition-all duration-200 ${activeComponent === item.key
                            ? 'bg-blue-600 text-white shadow-lg'
                            : item.key === 'conflicts'
                                ? 'text-yellow-500 hover:bg-gray-700 hover:text-white'
                                : item.key === 'delete'
                                    ? 'text-red-600 hover:bg-gray-700 hover:text-white'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        aria-label={item.label}
                        aria-pressed={activeComponent === item.key}
                        title={item.label}
                    >
                        {item.icon}
                    </button>
                ))}
            </nav>

            {/* Content area with consistent sizing */}
            <div className="flex-1 min-w-0 relative overflow-hidden bg-white dark:bg-dark text-black dark:text-gray-300">
                <div
                    role="tabpanel"
                    aria-labelledby="filters-tab"
                    hidden={activeComponent !== 'filters'}
                    className="absolute inset-0 transition-opacity duration-200"
                >
                    <div className="h-full pl-4 pr-2 py-3 overflow-auto">
                        <Filters />
                    </div>
                </div>

                <div
                    role="tabpanel"
                    aria-labelledby="properties-tab"
                    hidden={activeComponent !== 'properties'}
                    className="absolute inset-0 transition-opacity duration-200"
                >
                    <div className="h-full pl-4 pr-2 py-3 overflow-auto">
                        <ClassProperties />
                    </div>
                </div>

                <div
                    role="tabpanel"
                    aria-labelledby="timeProperties-tab"
                    hidden={activeComponent !== 'timeProperties'}
                    className="absolute inset-0 transition-opacity duration-200"
                >
                    <div className="h-full pl-4 pr-2 py-3 overflow-auto">
                        <ClassTimeProperties />
                    </div>
                </div>

                <div
                    role="tabpanel"
                    aria-labelledby="tags-tab"
                    hidden={activeComponent !== 'tags'}
                    className="absolute inset-0 transition-opacity duration-200"
                >
                    <div className="h-full pl-4 pr-2 py-3 overflow-auto">
                        <Tags />
                    </div>
                </div>

                <div
                    role="tabpanel"
                    aria-labelledby="conflicts-tab"
                    hidden={activeComponent !== 'conflicts'}
                    className="absolute inset-0 transition-opacity duration-200"
                >
                    <div className="h-full pl-4 pr-2 py-3 overflow-auto">
                        <ConflictProperties />
                    </div>
                </div>

                <div
                    role="tabpanel"
                    aria-labelledby="delete-tab"
                    hidden={activeComponent !== 'delete'}
                    className="absolute inset-0 transition-opacity duration-200"
                >
                    <div className="h-full pl-4 pr-2 py-3 overflow-auto">
                        <DeleteClass />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeftMenu;
