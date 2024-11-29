'use client'

import React, { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar/Calendar';
import ClassDisplay from '@/components/ClassDisplay/ClassDisplay';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';
import { CombinedClass } from '../api/types';
import { loadClassOfUser } from '../api/utils';
import Draggable from '@/components/Draggable/Draggable';

const CalendarPage = () => {
    const [combinedClasses, setClassData] = useState([] as CombinedClass[]);
    const [classLoading, setClassLoading] = useState(true);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

    useEffect(() => {
        if (classLoading) {
            loadClassOfUser("abc").then((classData) => {
                setClassData(classData);
                setClassLoading(false);
            }).catch(error => {
                console.error("Error loading class data:", error);
                setClassLoading(false);
            });
        }
    }, [classLoading]);

    if (combinedClasses[0]) {
        const currentClass = (
            <Draggable id={combinedClasses[0].classData.object_id} children={
                <ClassDisplay classData={combinedClasses[0].classData} classProperties={combinedClasses[0].classProperties} />
            }>
            </Draggable>
        );
        {/* Proposed solution to the offset is to move the DndContext into the Calendar component so that the offset stays with the scrolling*/ }
        return (<div className='flex flex-col'>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <Calendar />
                {currentClass}
            </DndContext>
            <DragOverlay>
                {activeId ? (
                    currentClass
                ) : null}
            </DragOverlay>
        </div>);
    } else {
        return (<div className='flex flex-col'>
            <Calendar />
        </div>);
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveId(null);
    }

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id);
    }
}

export default CalendarPage;