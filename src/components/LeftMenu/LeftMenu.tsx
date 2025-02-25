// Parent of Filters, and ClassProperties
'use client'

import Filters from "../Filters/Filters";
import ClassProperties from "../ClassProperties/ClassProperties";

const LeftMenu = () => {
    return (
        <div className="flex flex-col">
            <div className="p-4 pb-2">
                <Filters />
            </div>

            <div className="px-4 py-2">
                <ClassProperties />
            </div>
        </div>
    );
}

export default LeftMenu;