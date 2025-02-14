'use client'

import React, { useState } from 'react';
import Calendar2 from '@/components/Calendar2/Calendar2';
import CalendarSheet2 from '@/components/CalendarSheet2/CalendarSheet2';
import LeftMenu from '@/components/LeftMenu/LeftMenu';
import CalendarNav2 from '@/components/CalendarNav2/CalendarNav2';


const CalendarPage = () => {
    const [isCalendarOpen, setCalendarOpen] = useState(true);

    return (
        <div className='grid grid-cols-[10%_85%]'>
            <LeftMenu></LeftMenu>
            <div className='grid grid-rows-[10%_85%]'>
                <CalendarNav2 toggleCalendar={(status: boolean) => setCalendarOpen(status)}></CalendarNav2>
                {isCalendarOpen ?
                    <Calendar2></Calendar2> :
                    <CalendarSheet2></CalendarSheet2>
                }
            </div>
        </div>
    );
}

// (<div className='flex flex-col'>
//     <div className="min-w-[20vh] flex flex-col">
//         <LeftMenu></LeftMenu>
//     </div>
//     <div className="min-w-[80vw] flex flex-col">
//         <div>
//             <CalendarNav toggleCalendar={(status: boolean) => setCalendarOpen(status)}></CalendarNav>
//         </div>
//         <div className="rounded-b-3xl min-h-[80vh]">
//             {isCalendarOpen ?
//                 <Calendar></Calendar> :
//                 <CalendarSheet></CalendarSheet>
//             }
//         </div>
//     </div>
// </div>);

export default CalendarPage;

// return (
//     <div className="flex flex-row">
//         <div className="flex flex-col px-2 w-[20vh]">
//             <LeftMenu />
//         </div>
//         <div className="flex flex-col px-2 w-[80vw]">
//             <div className="flex p-4">
//                 <CalendarNav toggleCalendar={(status: boolean) => setCalendarOpen(status)} />
//             </div>
//             <div className="flex p-4">
//                 {isCalendarOpen ?
//                     <Calendar classes={combinedClasses} /> :
//                     <CalendarSheet></CalendarSheet>
//                 }
//             </div>
//         </div>
//     </div>
// );