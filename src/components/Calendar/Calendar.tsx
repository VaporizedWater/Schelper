'use client'

import { useState, useEffect } from "react";
import { Class, ClassProperty } from "@/app/api/types";
import { loadClassOfUser } from "@/app/api/utils";
import Day from "../Day/Day";
import TimeDisplay from "../TimeDisplay/TimeDisplay";
import TimeOfDay from "../TimeOfDay/TimeOfDay";
import LeftMenu from "../LeftMenu/LeftMenu";
import CalendarNav from "../CalendarNav/CalendarNav";
import CalendarGridNav from "../CalendarGridNav/CalendarGridNav";

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
                <LeftMenu />
                <div className="flex flex-col w-full max-h-screen mx-10 rounded-lg">
                    <div className="p-8 bg-gray-100 border border-gray rounded-t-md">
                        <CalendarGridNav />
                    </div>
                    <div className="grid grid-cols-[0.3fr,repeat(5,1fr)] bg-white border border-gray overflow-y-scroll scroll-smooth custom-scrollbar rounded-b-md">
                        <div className="sticky top-0 bg-white p-4 border border-gray">
                            <div className=""></div>
                        </div>

                        <div className="sticky top-0 bg-white p-4 border border-gray">
                            <Day dayName="Mon"></Day>
                        </div>

                        <div className="sticky top-0 bg-white p-4 border border-gray">
                            <Day dayName="Tue"></Day>
                        </div>

                        <div className="sticky top-0 bg-white p-4 border border-gray">
                            <Day dayName="Wed"></Day>
                        </div>

                        <div className="sticky top-0 bg-white p-4 border border-gray">
                            <Day dayName="Thu"></Day>
                        </div>

                        <div className="sticky top-0 bg-white p-4 border border-gray">
                            <Day dayName="Fri"></Day>
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