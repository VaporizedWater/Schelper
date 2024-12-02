'use client'

import React, { useState } from 'react';
import Day from "../Day/Day";
import TimeDisplay from "../TimeDisplay/TimeDisplay";
import TimeOfDay from "../TimeOfDay/TimeOfDay";
import LeftMenu from "../LeftMenu/LeftMenu";
import CalendarNav from "../CalendarNav/CalendarNav";
import { CalendarProps } from "@/app/api/types";
import { DndContext, DragEndEvent, DragMoveEvent, DragOverlay, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';
import Draggable from '../Draggable/Draggable';
import ClassDisplay from '../ClassDisplay/ClassDisplay';

// Parent of: LeftMenu, Day, TimeOfDay

export default function Calendar(props: CalendarProps) {

    function handleDragEnd(event: DragEndEvent) {
        const { active, over, delta } = event;
        if (over != null) {
            console.log("[" + delta.x + " " + delta.y + "]");
            console.log("data" + over.data.current);
        }
    }

    function handleDragStart(event: DragStartEvent) {

    }

    let currentClass = <Draggable id=""></Draggable>

    if (props.classes[0]) {
        currentClass = (
            <Draggable id={props.classes[0].classData.object_id} children={
                <ClassDisplay classData={props.classes[0].classData} classProperties={props.classes[0].classProperties} />
            }></Draggable>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="z-10">
                <CalendarNav />
            </div>

            <div className="flex flex-row">
                <div className="px-4"><LeftMenu /></div>

                <div className="flex flex-col w-full max-h-[82vh] mr-10">
                    <div className="flex flex-row">
                        <div className="w-full grid grid-cols-[0.3fr,repeat(5,1fr)] bg-white border-y border-l border-gray">
                            <div className="bg-white p-3 border border-gray shadow">
                                <div className=""></div>
                            </div>

                            <div className="bg-white p-3 border border-gray shadow">
                                <Day day="Mon" date={25}></Day>
                            </div>

                            <div className="bg-white p-3 border border-gray shadow">
                                <Day day="Tue" date={26}></Day>
                            </div>

                            <div className="bg-white p-3 border border-gray shadow">
                                <Day day="Wed" date={27}></Day>
                            </div>

                            <div className="bg-white p-3 border border-gray shadow">
                                <Day day="Thu" date={28}></Day>
                            </div>

                            <div className="bg-white p-3 border-y border-l border-gray shadow-b">
                                <Day day="Fri" date={29}></Day>
                            </div>
                        </div >
                        <div className="w-[12px] bg-white border-y-2 border-r-2 border-gray shadow-b shadow-r"></div>
                    </div>

                    {/*scrolling frame, removed options: */}
                    <div className="bg-white border border-gray overflow-y-scroll scrollbar-webkit scrollbar-thin rounded-b-3xl">
                        <DndContext id="scrolling_context" onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                            <div className='grid grid-cols-[0.3fr,repeat(5,1fr)] '>
                                <TimeDisplay />
                                <TimeOfDay day="Mon" />
                                <TimeOfDay day="Tue" />
                                <TimeOfDay day="Wed" />
                                <TimeOfDay day="Thu" />
                                <TimeOfDay day="Fri" />
                            </div>
                            {currentClass}
                        </DndContext>
                    </div >

                    {/* {isSpreadSheet &&
                        <div></div>
                    } */}
                </div>
            </div>
        </div>
    );
}

/*
<DragOverlay>
                            {activeId ? (currentClass) : null}
                        </DragOverlay>
*/