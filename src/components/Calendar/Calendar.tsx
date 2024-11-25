'use client'

import { useState, useEffect } from "react";
import { Class, ClassProperty } from "@/app/api/types";
import { loadClassOfUser } from "@/app/api/utils";
import Day from "../Day/Day";
import TimeDisplay from "../TimeDisplay/TimeDisplay";
import TimeOfDay from "../TimeOfDay/TimeOfDay";
import LeftMenu from "../LeftMenu/LeftMenu";
import CalendarNav from "../CalendarNav/CalendarNav";

// Parent of: LeftMenu, Day, TimeOfDay

export default function Calendar() {
    const [classData, setClassData] = useState([] as Class[]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isLoading) {
            loadClassOfUser("abc").then((result) => {
                setClassData(result);
                setIsLoading(false);
            }).catch(error => {
                console.error("Error loading class data:", error);
                setIsLoading(false);
            });
        }
    }, [isLoading]);

    if (!isLoading) {
        console.log(JSON.stringify(classData));
    }

    return (
        <div className="flex flex-col">
            <CalendarNav />

            <div className="flex flex-row">
                <div className="px-4"><LeftMenu /></div>

                <div className="flex flex-col w-full max-h-[82vh] mr-10">
                    <div className="grid grid-cols-[0.3fr,repeat(5,1fr)] bg-white border border-gray overflow-y-scroll scrollbar-webkit scrollbar-thin rounded-3xl">
                        <div className="sticky top-0 bg-white p-3 border border-gray shadow">
                            <div className=""></div>
                        </div>

                        <div className="sticky top-0 bg-white p-3 border border-gray shadow">
                            <Day dayName="Mon" date={25}></Day>
                        </div>

                        <div className="sticky top-0 bg-white p-3 border border-gray shadow">
                            <Day dayName="Tue" date={26}></Day>
                        </div>

                        <div className="sticky top-0 bg-white p-3 border border-gray shadow">
                            <Day dayName="Wed" date={27}></Day>
                        </div>

                        <div className="sticky top-0 bg-white p-3 border border-gray shadow">
                            <Day dayName="Thu" date={28}></Day>
                        </div>

                        <div className="sticky top-0 bg-white p-3 border border-gray shadow">
                            <Day dayName="Fri" date={29}></Day>
                        </div>

                        <TimeDisplay />
                        <TimeOfDay />
                        <TimeOfDay />
                        <TimeOfDay />
                        <TimeOfDay />
                        <TimeOfDay />
                    </div>
                </div >
            </div>
        </div>
    );
}