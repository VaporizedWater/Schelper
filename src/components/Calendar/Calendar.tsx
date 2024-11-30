'use client'

import Day from "../Day/Day";
import TimeDisplay from "../TimeDisplay/TimeDisplay";
import TimeOfDay from "../TimeOfDay/TimeOfDay";
import LeftMenu from "../LeftMenu/LeftMenu";
import CalendarNav from "../CalendarNav/CalendarNav";

// Parent of: LeftMenu, Day, TimeOfDay

export default function Calendar() {
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
                    <div className="grid grid-cols-[0.3fr,repeat(5,1fr)] bg-white border border-gray overflow-y-scroll scrollbar-webkit scrollbar-thin rounded-b-3xl">
                        <TimeDisplay />
                        <TimeOfDay day="Mon" />
                        <TimeOfDay day="Tue" />
                        <TimeOfDay day="Wed" />
                        <TimeOfDay day="Thu" />
                        <TimeOfDay day="Fri" />
                    </div >

                    {/* {isSpreadSheet &&
                        <div></div>
                    } */}
                </div>
            </div>
        </div>
    );
}