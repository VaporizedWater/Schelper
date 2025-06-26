'use client'

import React, { useEffect, useState } from 'react';
import Calendar from '@/components/Calendar/Calendar';
import CalendarSheet from '@/components/CalendarSheet/CalendarSheet';
import LeftMenu from '@/components/LeftMenu/LeftMenu';
import CalendarNav from '@/components/CalendarNav/CalendarNav';
import { useSearchParams } from 'next/navigation';
import { useCalendarContext } from '@/components/CalendarContext/CalendarContext';
import { FaChevronCircleLeft } from 'react-icons/fa';

const CalendarPage = () => {
    const [isCalendarOpen, setCalendarOpen] = useState(true);
    const [isLeftMenuVisible, setLeftMenuVisible] = useState(true);
    const searchParams = useSearchParams();
    const { allClasses, updateAllClasses } = useCalendarContext();

    // Apply cohort filter from URL parameter
    useEffect(() => {
        const cohort = searchParams.get('cohort');

        if (cohort && ['freshman', 'sophomore', 'junior', 'senior'].includes(cohort)) {
            // Filter classes to only show those with the matching cohort tag
            const updatedClasses = allClasses.map(cls => {
                const isVisible = cls.properties.tags?.some(tag => tag.tagName === cohort);
                return {
                    ...cls,
                    visible: isVisible
                };
            });

            updateAllClasses(updatedClasses);
        } else {
            // If no cohort filter or invalid cohort, show all classes
            const updatedClasses = allClasses.map(cls => {
                return {
                    ...cls,
                    visible: true
                };
            });

            updateAllClasses(updatedClasses);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="h-full flex">
            {/* sidebar */}
            {isLeftMenuVisible && (
                <div className="w-[17%] min-w-[200px] overflow-auto">
                    <LeftMenu />
                </div>
            )}

            {/* main content always flex-1 */}
            <div className="flex-1 relative flex flex-col">
                {/* toggle button */}
                <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-gray-500/40 hover:text-gray-500/60 dark:text-gray-300/40 dark:hover:text-gray-100/60 transition-transform duration-200 ease-in-out rounded-full shadow-md hover:shadow-lg"
                    onClick={() => setLeftMenuVisible(v => {
                        const next = !v;
                        // let the CSS transition finish, then fire resize
                        setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
                        return next;
                    })}
                >
                    <FaChevronCircleLeft
                        size={30}
                        className={isLeftMenuVisible ? '' : 'rotate-180'}
                    />
                </button>

                <div className="h-auto">
                    <CalendarNav toggleCalendar={setCalendarOpen} />
                </div>

                <div className="flex-1 overflow-hidden px-2">
                    {isCalendarOpen ? <Calendar /> : <CalendarSheet />}
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;