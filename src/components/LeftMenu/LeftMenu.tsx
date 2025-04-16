'use client'

import { useState } from "react";
import Filters from "../Filters/Filters";
import ClassProperties from "../ClassProperties/ClassProperties";
import { FaFilter, FaListUl } from "react-icons/fa";

const LeftMenu = () => {
    const [activeComponent, setActiveComponent] = useState<'filters' | 'properties'>('filters');

    return (
        <div className="flex h-full">
            {/* Icon sidebar */}
            <div className="flex-none flex flex-col py-4 bg-gray-100 border-r border-gray-300 w-12">
                <div
                    className={`p-2 mb-2 cursor-pointer flex justify-center items-center rounded-md mx-2 transition-all duration-200 ${activeComponent === 'filters'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'hover:bg-gray-700 hover:text-white'
                        }`}
                    onClick={() => setActiveComponent('filters')}
                    title="Filters"
                >
                    <FaFilter size={14} />
                </div>
                <div
                    className={`p-2 cursor-pointer flex justify-center items-center rounded-md mx-2 transition-all duration-200 ${activeComponent === 'properties'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'hover:bg-gray-700 hover:text-white'
                        }`}
                    onClick={() => setActiveComponent('properties')}
                    title="Class Properties"
                >
                    <FaListUl size={14} />
                </div>
            </div>

            {/* Content area with consistent sizing */}
            <div className="flex-1 min-w-0 relative overflow-hidden">
                <div className={`absolute inset-0 transition-opacity duration-200 ${activeComponent === 'filters' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}>
                    <div className="h-full px-4 py-3 overflow-auto">
                        <Filters />
                    </div>
                </div>

                <div className={`absolute inset-0 transition-opacity duration-200 ${activeComponent === 'properties' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}>
                    <div className="h-full pl-2 py-3 overflow-auto">
                        <ClassProperties />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeftMenu;