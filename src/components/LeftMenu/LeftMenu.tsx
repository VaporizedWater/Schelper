// Parent of Filters, and ClassProperties
'use client'

import Filters from "../Filters/Filters";
import ClassProperties from "../ClassProperties/ClassProperties";

const LeftMenu = () => {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Filters section with fixed height */}
            <div className="px-4 py-3 flex-shrink-0">
                <Filters />
            </div>

            {/* ClassProperties section with proper height constraints */}
            <div className="px-4 py-1 flex-grow h-0 min-h-0 overflow-hidden">
                <ClassProperties />
            </div>
        </div>
    );
}

export default LeftMenu;