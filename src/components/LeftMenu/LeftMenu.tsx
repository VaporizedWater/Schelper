'use client'

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

    return (
        <div className="flex h-full">
            {/* Icon sidebar */}
            <div className="flex-none flex flex-col py-4 bg-gray-100 dark:bg-dark border-r border-gray-300 dark:border-gray-600 w-12">
                <div
                    className={`p-2 mb-2 cursor-pointer flex justify-center items-center rounded-md mx-2 transition-all duration-200 ${activeComponent === 'filters'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    onClick={() => setActiveComponent('filters')}
                    title="Filters"
                >
                    <FaFilter size={14} />
                </div>
                <div
                    className={`p-2 mb-2 cursor-pointer flex justify-center items-center rounded-md mx-2 transition-all duration-200 ${activeComponent === 'properties'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    onClick={() => setActiveComponent('properties')}
                    title="Class Properties"
                >
                    <FaListUl size={14} />
                </div>
                <div
                    className={`p-2 mb-2 cursor-pointer flex justify-center items-center rounded-md mx-2 transition-all duration-200 ${activeComponent === 'timeProperties'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    onClick={() => setActiveComponent('timeProperties')}
                    title="Time Properties"
                >
                    <FaClock size={14} />
                </div>
                <div
                    className={`p-2 mb-2 cursor-pointer flex justify-center items-center rounded-md mx-2 transition-all duration-200 ${activeComponent === 'tags'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    onClick={() => setActiveComponent('tags')}
                    title="Tags"
                >
                    <FaTag size={14} />
                </div>
                <div
                    className={`p-2 mb-2 cursor-pointer flex justify-center items-center rounded-md mx-2 transition-all duration-200 ${activeComponent === 'conflicts'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-yellow-500 hover:bg-gray-700 hover:text-white'
                        }`}
                    onClick={() => setActiveComponent('conflicts')}
                    title="Conflicts"
                >
                    <div className="">
                        <MdWarning size={14} />
                    </div>
                </div>
                <div
                    className={`p-2 cursor-pointer flex justify-center items-center rounded-md mx-2 transition-all duration-200 ${activeComponent === 'delete'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-red-600 hover:bg-gray-700 hover:text-white'
                        }`}
                    onClick={() => setActiveComponent('delete')}
                    title="Delete Class"
                >
                    <div className="">
                        <MdDelete size={14} />
                    </div>
                </div>
            </div>

            {/* Content area with consistent sizing */}
            <div className="flex-1 min-w-0 relative overflow-hidden bg-white dark:bg-dark text-black dark:text-gray-300">
                <div className={`absolute inset-0 transition-opacity duration-200 ${activeComponent === 'filters' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}>
                    <div className="h-full pl-4 pr-2 py-3 overflow-auto">
                        <Filters />
                    </div>
                </div>

                <div className={`absolute inset-0 transition-opacity duration-200 ${activeComponent === 'properties' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}>
                    <div className="h-full pl-4 pr-2 py-3 overflow-auto">
                        <ClassProperties />
                    </div>
                </div>
                <div className={`absolute inset-0 transition-opacity duration-200 ${activeComponent === 'timeProperties' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}>
                    <div className="h-full pl-4 pr-2 py-3 overflow-auto">
                        <ClassTimeProperties />
                    </div>
                </div>
                <div className={`absolute inset-0 transition-opacity duration-200 ${activeComponent === 'tags' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}>
                    <div className="h-full pl-4 pr-2 py-3 overflow-auto">
                        <Tags />
                    </div>
                </div>
                <div className={`absolute inset-0 transition-opacity duration-200 ${activeComponent === 'conflicts' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}>
                    <div className="h-full pl-4 pr-2 py-3 overflow-auto">
                        <ConflictProperties />
                    </div>
                </div>
                <div className={`absolute inset-0 transition-opacity duration-200 ${activeComponent === 'delete' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}>
                    <div className="h-full pl-4 pr-2 py-3 overflow-auto">
                        <DeleteClass />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeftMenu;