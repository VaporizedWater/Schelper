"use client";

import { useState } from "react";
import Spreadsheet, { Matrix } from "react-spreadsheet";

export default function CalendarSheet2() {
    const [data, setData] = useState<Matrix<{ value: string }>>([
        [
            { value: "Catalog Number" },
            { value: "Class Number" },
            { value: "Session" },
            { value: "Course Subject" },
            { value: "Course Number" },
            { value: "Section" },
            { value: "Title" },
            { value: "Location" },
            { value: "Enrollment Capacity" },
            { value: "Waitlist Capacity" },
        ],
        [
            { value: "15393" },
            { value: "5936" },
            { value: "1" },
            { value: "EDSGN" },
            { value: "100S" },
            { value: "004" },
            { value: "Intro Engr Dsgn" },
            { value: "ERIE" },
            { value: "18" },
            { value: "0" },
        ],
        [
            { value: "10101" },
            { value: "5001" },
            { value: "1" },
            { value: "SWENG" },
            { value: "311" },
            { value: "001" },
            { value: "Object-Oriented Software Design and Construction" },
            { value: "UP" },
            { value: "30" },
            { value: "5" },
        ],
        [
            { value: "10202" },
            { value: "5002" },
            { value: "1" },
            { value: "SWENG" },
            { value: "400" },
            { value: "001" },
            { value: "Introduction to Software Engineering Studio" },
            { value: "UP" },
            { value: "25" },
            { value: "5" },
        ],
        [
            { value: "10303" },
            { value: "5003" },
            { value: "1" },
            { value: "SWENG" },
            { value: "411" },
            { value: "001" },
            { value: "Software Engineering" },
            { value: "UP" },
            { value: "20" },
            { value: "5" },
        ],
        [
            { value: "10404" },
            { value: "5004" },
            { value: "1" },
            { value: "SWENG" },
            { value: "421" },
            { value: "001" },
            { value: "Software Architecture" },
            { value: "UP" },
            { value: "35" },
            { value: "5" },
        ],
        [
            { value: "10505" },
            { value: "5005" },
            { value: "1" },
            { value: "SWENG" },
            { value: "431" },
            { value: "001" },
            { value: "Software Verification, Validation, and Testing" },
            { value: "UP" },
            { value: "40" },
            { value: "5" },
        ],
        [
            { value: "10606" },
            { value: "5006" },
            { value: "1" },
            { value: "SWENG" },
            { value: "480" },
            { value: "001" },
            { value: "Software Engineering Design" },
            { value: "UP" },
            { value: "30" },
            { value: "5" },
        ],
    ]);

    return (
        <div className="min-h-[80vh] h-[80vh] min-w-[80vw] w-[80vw]">
            <Spreadsheet data={data} onChange={setData} />
        </div>
    );
}