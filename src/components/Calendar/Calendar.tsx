'use client'

import { useState, useEffect } from "react";
import { ClassInfo } from "@/app/api/types";
import { loadClassDataOfUser } from "@/app/api/utils";

// Parent of: Day, TimeOfDay

export default function Calendar() {
    const [classData, setClassData] = useState([] as ClassInfo[]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isLoading) {
            loadClassDataOfUser("abc").then((result) => {
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

    return <div></div>
}