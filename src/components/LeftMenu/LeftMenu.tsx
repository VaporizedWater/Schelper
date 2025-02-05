// Parent of Filters, and ClassProperties
'use client'

import { useEffect, useState } from "react";
import Filters from "../Filters/Filters";
import { TagProps } from "@/lib/types";
import ClassProperties from "../ClassProperties/ClassProperties";

const LeftMenu = () => {
    const [tagList, setTags] = useState<TagProps[]>([]);

    useEffect(() => {
        const fetchTags = async () => {
            const res = await fetch('/api/tags');
            const data = await res.json();
            setTags(data);
        }

        fetchTags();
    }, []);

    return (
        <div className="flex flex-col max-w-fit max-h-fit min-h-fit">
            <div className="px-4 my-4">
                <Filters tags={tagList} />
            </div>

            <div className="p-4">
                <ClassProperties />
            </div>
        </div>
    );
}

export default LeftMenu;