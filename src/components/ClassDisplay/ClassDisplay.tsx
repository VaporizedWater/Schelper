import { CombinedClass } from "@/app/api/types";

const ClassDisplay = (props: CombinedClass) => {
    const classData = props.classData;
    const classProperties = props.classProperties;

    let display = (<div></div>);

    if (classData && classProperties) {
        display = (
            <div className="w-fit p-4">
                <div className="p-2 border-4 border-gray">
                    Class: {classData.course_subject + classData.course_num}
                    <br></br>
                    
                </div>
                {/*
                    Place commented portion below here, if you want to do something with it
                */}
            </div>
        );
    }


    return display;
}

export default ClassDisplay;


/*
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
*/