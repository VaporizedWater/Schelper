// Parent of Filters, and ClassProperties
'use client'

import Filters from "../Filters/Filters";
import ClassProperties from "../ClassProperties/ClassProperties";

const LeftMenu = () => {
    return (
        <div className="flex flex-col">
            <div className="px-4 my-4">
                <Filters />
            </div>

            <div className="p-4">
                <ClassProperties />
            </div>
        </div>
    );
}

export default LeftMenu;