import { ClassIdProps, ClassInfo } from "@/app/api/types";
import { loadClassData } from "@/app/api/utils";
import { useState, useEffect } from "react";

const ClassDisplay = (props: ClassIdProps) => {
    const [classData, setClassData] = useState<ClassInfo | null>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isLoading) {
            loadClassData(props.classId).then((result) => {
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

    const nullDisplay = (
        <div>Class not found!</div>
    );

    return (!classData ? nullDisplay :
        <div className="w-fit p-4">
            <ul className="flex flex-col border-4 border-gray">
                <li key="1" className="border border-gray">{classData.catalog_num}</li>
                <li key="2" className="border border-gray">{classData.class_num}</li>
                <li key="3" className="border border-gray">{classData.course_num}</li>
                <li key="4" className="border border-gray">{classData.course_subject}</li>
                <li key="5" className="border border-gray">{classData.instructor_email}</li>
                <li key="6" className="border border-gray">{classData.instructor_name}</li>
            </ul>
        </div>
    );
}

export default ClassDisplay;