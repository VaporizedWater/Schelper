import { ClassIdProps, Class, ClassProperty } from "@/app/api/types";
import { loadClassFromID, loadClassPropertiesFromID } from "@/app/api/utils";
import { useState, useEffect } from "react";

const ClassDisplay = (props: ClassIdProps) => {
    const [classData, setClassData] = useState<Class | null>();
    const [isClassLoading, setIsClassLoading] = useState(true);
    const [classProperties, setClassProperties] = useState<ClassProperty | null>();
    const [isClassPropertiesLoading, setIsClassPropertiesLoading] = useState(true);

    // Class Data
    useEffect(() => {
        if (isClassLoading) {
            loadClassFromID(props.classId).then((result) => {
                setClassData(result);
                setIsClassLoading(false);
            }).catch(error => {
                console.error("Error loading class data:", error);
                setIsClassLoading(false);
            });
        }
    }, [isClassLoading]);

    // Class Properties
    useEffect(() => {
        if (isClassPropertiesLoading) {
            loadClassPropertiesFromID(props.classId).then((result) => {
                setClassProperties(result);
                setIsClassPropertiesLoading(false);
            }).catch(error => {
                console.error("Error loading class data:", error);
                setIsClassPropertiesLoading(false);
            });
        }
    }, [isClassPropertiesLoading]);

    if (!(isClassLoading && isClassPropertiesLoading)) {
        console.log(JSON.stringify(classData));
        console.log(JSON.stringify(classProperties));
    }

    const nullDisplay = (
        <div>Class not found!</div>
    );

    return (!(classData && classProperties) ? nullDisplay :
        <div className="w-fit p-4">
            <div className="p-2 border-4 border-gray">
                Class: {classData.course_subject}
            </div>
            <ul className="border-4 border-gray grid grid-cols-2">
                <li key="1" className="border border-gray">Catalog Num: </li>
                <li key="2" className="border border-gray">{classData.catalog_num}</li>
                <li key="3" className="border border-gray">Class Num: </li>
                <li key="4" className="border border-gray">{classData.class_num}</li>
                <li key="5" className="border border-gray">Course Num </li>
                <li key="6" className="border border-gray">{classData.course_num}</li>

                <li key="7" className="border border-gray">Course Subject:</li>
                <li key="8" className="border border-gray">{classData.course_subject}</li>
                <li key="9" className="border border-gray">Instructor Email: </li>
                <li key="10" className="border border-gray">{classProperties.instructor_email}</li>
                <li key="11" className="border border-gray">Instructor Name:</li>
                <li key="12" className="border border-gray">{classProperties.instructor_name}</li>
            </ul>
        </div>
    );
}

export default ClassDisplay;